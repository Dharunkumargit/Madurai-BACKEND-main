import IdcodeModel from "../idcode/idcode.mode.js";
import logger from "../config/logger.js";

class IdcodeServices {
  static async getCode(idname) {
    try {
      return await IdcodeModel.findOne({ idname });
    } catch (error) {
      logger.error("error while get a code" + error);
    }
  }
  static async updateCode(idname, codes) {
    try {
      var query = { idname: idname };
      var values = { $set: { codes: codes } };
      return await IdcodeModel.updateOne(query, values);
    } catch (error) {
      logger.error("error while updating a code" + error);
      console.log("Error in updating Code");
    }
  }
  static async generateCode(idname) {
  try {
    let codeDoc = await this.getCode(idname);

    
    if (!codeDoc) {
      let prefix = "";

      switch (idname) {
        case "EMPLOYEE":
          prefix = "EMP";
          break;
        case "USER":
          prefix = "USER";
          break;
        case "ROLE":
          prefix = "ROLE";
          break;
        default:
          throw new Error("Invalid ID name");
      }

      await this.addIdCode(idname, prefix);
      codeDoc = await this.getCode(idname);
    }

    let { idcode, codes } = codeDoc;
    codes += 1;

    const id =
      codes < 10
        ? `${idcode}00${codes}`
        : codes < 100
        ? `${idcode}0${codes}`
        : `${idcode}${codes}`;

    await this.updateCode(idname, codes);
    return id;
  } catch (error) {
    logger.error("Error while generating code: " + error.message);
    throw error;
  }
}

  static async addIdCode(idname, idcode) {
    try {
      const existingCode = await IdcodeModel.findOne({ idname });
      if (existingCode) {
        logger.warn(`Id code with idname ${idname} already exists.`);
        return existingCode;
      }
      const newIdCode = new IdcodeModel({
        idname,
        idcode,
        codes: 0,
      });
      return await newIdCode.save();
    } catch (error) {
      logger.error("error while adding a new id code" + error);
      console.log("Error in adding Id Code");
    }
  }
}
export default IdcodeServices;
