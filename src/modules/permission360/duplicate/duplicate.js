import { LightningElement,api } from 'lwc';


export default class HelloWorldApp extends LightningElement {

    header = '';
    permissionSetNames = [];
    showComparison = false;
    psName = '';    
    headers = ['Name','Comparison'];
    showDuplicate = false;
    showDuplicateList = false;
    showComparisonAggregate = false;
    toCompare = '';


        connectedCallback(){

        }

        @api 
        showDuplicateModal(psName,data,header){
                this.psName = psName;
                this.permissionSetNames = data;
                this.header = header;
                this.showDuplicateList = true;
                this.showDuplicate = true;
        }

        @api 
        hideDuplicateModal(){
                this.showDuplicate = false;
        }

        doCompare(event){
                this.toCompare = event.target.dataset.key;
                this.header = `Compare ${this.psName} with ${this.toCompare}`;
                fetch("/api/comparison/"+event.target.dataset.key+"/"+this.psName).
                then((response) => response.json()).then((data) =>{
                        this.template.querySelector('permission360-comparison').onCompare(this.psName,this.toCompare,data);
                        this.showDuplicateList = false;
                     
                }).catch(error =>{
           
                    console.error(error);
                });
        }

        backToDuplicateList(event){
                 this.template.querySelector('permission360-comparison').hideComparison();
                  this.showDuplicateList = true;      
        }

        showPermissionList(event){
                    this.showDuplicateList = true;
                    this.template.querySelector('permission360-comparison').hideComparison();    
        }


        showComparisonDashboard(event){
                this.showDuplicateList = false;
                this.template.querySelector('permission360-comparison').showComparisonDashboard();    
               
        }

        showComparisonList(event){
                this.showDuplicateList = false;
                this.template.querySelector('permission360-comparison').showComparisonDetail();    
        }

}