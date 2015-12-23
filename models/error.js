/**
 * @author Laboratorio delle Idee s.r.l.
 */
exports.send = function(req,res,obj){
	res.status(obj.status);
   	res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Content-Type',  obj.contentType);
	res.send(obj.message);
}
