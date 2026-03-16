export const PERMISSIONS = {
    ALL: 'A',
    CREATE: 'C',
    READ: 'R',
    UPDATE: 'U',
    DELETE: 'D',
  } ;
  
  export const UserLevel = {
    SYSTEM: 'SYSTEM',
    ADMIN: 'ADMIN',
    USER: 'USER',
  } ;
  
  export const PageConst = {
    DEFAULT_SORT: 'createdAt',
    DEFAULT_ORDER: 'desc',
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  }
  
  export const Status = {
    NEW: 'NEW',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  } 
  
  export const VerificationStatus = {
    VERIFIED: 'VERIFIED',
    NOT_VERIFIED: 'NOT_VERIFIED',
  } 
  
  export const loggerConst = {
    LOGGER_FILE_NAME: 'logs/apps-%DATE%.log',
    LOGGER_DATE_PATTERN: 'YYYY-MM-DD',
    LOGGER_MAX_FILE_SIZE: '20m',
    LOGGER_MAX_FILE_BACKUP: '14d',
    LOGGER_LEVEL: 'info',
  }
  
  export const HttpMethod = {
    PUT: 'PUT',
    POST: 'POST',
    GET: 'GET',
    DELETE: 'DELETE',
  };
  
  export const ClientHeader = {
    ADMIN: 'ADMIN',
    MOBILE: 'MOBILE',
  }