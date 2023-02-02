import fs from 'fs-extra';

import convert from "xml-js";

import path from "path";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..','permissions_config.json')));


let getJsonOfMetadata = function(fileName){
        var metaxml = fs.readFileSync(fileName, 'utf8');
        return JSON.parse(convert.xml2json(metaxml, {compact: true, spaces: 4}));
};

export let getAllPermissionSets = () => {

    let allFiles = [];
  
    for(var file of fs.readdirSync(path.resolve(__dirname, '..','permissionsets'))){
            if(!file.includes('permissionset-meta.xml'))
                    continue;
            file = file.replace('.permissionset-meta.xml','');
            allFiles.push(file);
    }

    return allFiles;

};



export let getAllPermissionsTotal = () =>{
   
    let totalMap = new Map();

    for(var file of fs.readdirSync(path.resolve(__dirname, '..','permissionsets'))){
           
            if(!file.includes('permissionset-meta.xml'))
                    continue;
            let profileJson = getJsonOfMetadata(path.resolve(__dirname, '..','permissionsets',file));
            totalMap = parsePermissionSetJson(profileJson,totalMap);
    }

    constructKey();

    return parsePermissionNumbers(totalMap);
};


export let getPermissionSet= (psName) =>{
    let fileLocation =path.resolve(__dirname, '..','permissionsets',psName+'.permissionset-meta.xml');
    let metaXml = fs.readFileSync(fileLocation,'utf-8');
    let permissionJson = JSON.parse(convert.xml2json(metaXml, {compact: true, spaces: 4}));
    let totalMap = parsePermissionSetJson(permissionJson,new Map());
    let response = {};
    response.jsonData = permissionJson;
    response.totalNumbers = parsePermissionNumbers(totalMap);
    return response;
}



let parsePermissionSetJson = (profileJson,totalMap) => {

    for(var col of Object.keys(config)){
            let mySet = new Set();
            if(totalMap.has(col)){
                    mySet = totalMap.get(col);
            }
            if(profileJson.PermissionSet.hasOwnProperty(col)){
                if(profileJson.PermissionSet[col].length){
                    for(let permission of profileJson.PermissionSet[col]){
                            let metadata = permission[config[col]];
                            mySet.add(metadata._text);
                    }
                }else{
                    let obj = profileJson.PermissionSet[col];
                    let metadata = obj[config[col]];
                    mySet.add(metadata._text);
                }
            }
            totalMap.set(col,mySet);
    }

    return totalMap;
}

let parsePermissionNumbers = (totalMap) => {
    let responseJson = [];
    for (let [key, value] of totalMap){
            let resp = {};
            resp.label = key;
            resp.value = value.size;
            responseJson.push(resp);
    }

    return responseJson;
};

export let findDuplicates = (psName) => {

            let allKeys = constructKey();
            let permissionJson = allKeys.get(psName);
            let duplicates = [];
            let alreadyCoveredPermissionSets = [];

            for(let [key, value] of allKeys){

                    if(key == psName)
                            continue;
                    let isDuplicate = true;

                    let isalreadyCoveredPermissionSet = true;

                    for(let [key2, value2] of value){
                            
                            let toCompare = '';
                            let original = '';

                            let originalPermissions = permissionJson.get(key2);
                            
                            if(value2.size > 0){
                                    toCompare = Array.from(value2).sort().join(',');
                            }

                            if(originalPermissions.size > 0){
                                    original = Array.from(originalPermissions).sort().join(',');
                            }

    
                            if(original != toCompare){
                                    isDuplicate = false;
                                    if(!toCompare.includes(original)){
                                            isalreadyCoveredPermissionSet = false;
                                    }
                            }
                    }

                    if(isDuplicate){
                                    duplicates.push(key);
                    }else if(isalreadyCoveredPermissionSet){
                                    alreadyCoveredPermissionSets.push(key);
                    }
            }

            let dupObj = {};
            dupObj.duplicates = duplicates;
            dupObj.alreadyCoveredPermissionSets = alreadyCoveredPermissionSets;
            return dupObj;
}

export let doComparison = (original, toCompare) => {

    let originalProfileJson = getJsonOfMetadata(path.resolve(__dirname, '..','permissionsets',original+'.permissionset-meta.xml'));
    let originalProfileMap = parsePermissionSetJson(originalProfileJson,new Map());
 
    let toCompareProfileJson = getJsonOfMetadata(path.resolve(__dirname, '..','permissionsets',toCompare+'.permissionset-meta.xml'));
    let toCompareProfileMap = parsePermissionSetJson(toCompareProfileJson,new Map());
 
    let comparisonResults = [];

    for(let [key, value] of originalProfileMap){

            let compare = {};
            compare.key = key;

            compare.original = value;



            let toCompareProperties = toCompareProfileMap.get(key);
            compare.toCompare = toCompareProperties;

            compare.additionalValues = Array.from(value).filter(x => !toCompareProperties.has(x))
            compare.existingValues= Array.from(value).filter(x => toCompareProperties.has(x))
            compare.notExistingValues= Array.from(toCompareProperties).filter(x => !value.has(x))
            

            compare.additionalValuesLength = compare.additionalValues.length;
            compare.existingValuesLength = compare.existingValues.length;
            compare.notExistingValuesLength = compare.notExistingValues.length;

            comparisonResults.push(compare);
    }

    return comparisonResults;



};



let constructKey = () => {
    let allKeys = new Map();
    for(var file of fs.readdirSync(path.resolve(__dirname, '..','permissionsets'))){

            if(!file.includes('permissionset-meta.xml'))
            continue;
            
            let profileJson = getJsonOfMetadata(path.resolve(__dirname, '..','permissionsets',file));
            let totalMap = parsePermissionSetJson(profileJson,new Map());
            allKeys.set(file.replace('.permissionset-meta.xml',''),totalMap);
    }

    return allKeys;
};


export default {
    getPermissionSet,findDuplicates,getAllPermissionSets,getAllPermissionsTotal,doComparison
}