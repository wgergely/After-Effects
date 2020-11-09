function save(){
    error=false;
    try{a=app.activeDocument.fullName;}catch(e){alert('No Active Document, or document has not yet been saved.');error=true};
    if (!error){
        b=new File(a);
        b.parent.execute();
    }
}
try{save()}catch(err){alert(err)}