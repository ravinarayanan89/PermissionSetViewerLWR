import { LightningElement,api } from 'lwc';


export default class HelloWorldApp extends LightningElement {

    permissions = [];
    showComparisonAggregate = false;
    showComparisonInDetail = false;
    comparisonData = [];
    comparisonWindowHeaders = [];

        connectedCallback(){
            
           
        }

        @api
        onCompare(from,to,data){
                this.permissions = data;
                for(var item of this.permissions){
                    const result = item.key.replace(/([A-Z])/g, " $1");
                    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                    item.label = finalResult;
                }
                this.permissions = [...this.permissions];
                this.showComparisonAggregate = true;
                this.showComparisonInDetail = false;
                this.comparisonWindowHeaders = [];
                this.comparisonWindowHeaders.push(from);
                this.comparisonWindowHeaders.push(to);
        }

        @api 
        hideComparison(){
            this.showComparisonAggregate = false;
            this.showComparisonInDetail = false;
        }

        openComparisonWindow(event){

               this.comparisonData = [];
               this.showComparisonAggregate = false;

               let data = {};
                let count = 0;
               for(var item of this.permissions){
                    if(event.currentTarget.dataset.key === item.key){
                            data = item;
                            break;
                    }
               }

               if(Array.isArray(data.notExistingValues)){
                    for(var item of data.notExistingValues){
                            count += 1
                            let compareData = {};
                            compareData.original = item;
                            compareData.key = count
                            compareData.toCompare = '';
                            compareData.bgClassName = 'existing';
                            this.comparisonData.push(compareData);
                    }
                }

                if(Array.isArray(data.additionalValues)){
                    for(var item of data.additionalValues){
                             count += 1
                            let compareData = {};
                            compareData.original = '';
                            compareData.key = count;
                            compareData.toCompare = item;
                            compareData.bgClassName = 'new';
                            this.comparisonData.push(compareData);
                    }
                }

                if(Array.isArray(data.existingValues)){
                for(var item of data.existingValues){
                        count += 1
                        let compareData = {};
                        compareData.original = item;
                        compareData.key = count;
                        compareData.toCompare = item;
                        compareData.bgClassName = '';
                        this.comparisonData.push(compareData);
                    
                }
            }

         
                    
                this.comparisonData = [...this.comparisonData];

                console.log(this.comparisonData);
                this.showComparisonInDetail = true;
                
        }


        @api 
        showComparisonDashboard() { 
            this.showComparisonAggregate = true;
            this.showComparisonInDetail = false;
        }

        @api 
        showComparisonDetail() { 
            this.showComparisonAggregate = false;
            this.showComparisonInDetail = true;
        }
}