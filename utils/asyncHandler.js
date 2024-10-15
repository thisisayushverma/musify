const asynHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>{
            console.log(err);
            next
        })
    }
}


export {asynHandler}