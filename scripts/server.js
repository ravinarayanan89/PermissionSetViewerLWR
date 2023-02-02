import { createServer } from "lwr";
const lwrServer = createServer({serverType : 'express'});
import { getPermissionSet,findDuplicates,getAllPermissionSets,getAllPermissionsTotal,doComparison } from "./readMetadataXml.js";
const app = lwrServer.getInternalServer();

app.get('/api/permissionset/:name' , (req,res) => {
        let psName = req.params.name;
        res.json(getPermissionSet(psName));
});

app.get('/api/findduplicates/:name' , (req,res) => {
        let psName = req.params.name;
        res.json(findDuplicates(psName));
});


app.get('/api/allpermissionsets', (req,res)=>{
        res.json(getAllPermissionSets());
});

app.get('/api/get360Permissions' , (req,res) =>{
        res.json(getAllPermissionsTotal());
});

app.get('/api/comparison/:from/:to' , (req,res) =>{
        let fromPermission = req.params.from;
        let toPermission = req.params.to;
        res.json(doComparison(fromPermission,toPermission));
});






lwrServer.listen(({port,serverMode})=>{
    console.log(`Server Listening on http://localhost:${port}`);
}).catch((err)=>{
    console.log(`error in server ${err}`);
});

