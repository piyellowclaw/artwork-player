'use strict';
function isAllowedRequest(raw,origin){try{const u=new URL(raw);return u.origin===origin||['data:','blob:','about:'].includes(u.protocol);}catch{return false;}}
module.exports={isAllowedRequest};
