import { LightningElement, track } from 'lwc'

export default class HelloWorldApp extends LightningElement {
    permissionJson = {}
    permissions = []

    allPermissionSets = []
    selectedPermission = ''
    showDuplicate = false

    dupObj = {}
    loading = { full: false, duplicate: false, specific_permissions: false }

    configs = {
        applicationVisibilities: 'application',
        classAccesses: 'apexClass',
        customMetadataTypeAccesses: 'name',
        customPermissions: 'name',
        customSettingAccesses: 'name',
        externalDataSourceAccesses: 'externalDataSource',
        fieldPermissions: 'field',
        flowAccesses: 'flow',
        objectPermissions: 'object',
        pageAccesses: 'apexPage',
        recordTypeVisibilities: 'recordType',
        tabSettings: 'tab',
        userPermissions: 'name',
    }
    listItems = []
    showListItems = false
    selectedMetadata = false

    tableHeaders = [];

    connectedCallback() {
        this.loading.full = true
        this.getAllPermissionSets()
        this.get360PermissionNumbers()
    }

    getAllPermissionSets() {
        fetch('/api/allpermissionsets')
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                let permissionSets = []
                for (var item of data) {
                    permissionSets.push({
                        visible: true,
                        name: item,
                    })
                }
                this.allPermissionSets = permissionSets
            })
            .catch((error) => {
                console.error(error)
            })
    }

    get360PermissionNumbers() {
        fetch('/api/get360Permissions')
            .then((response) => response.json())
            .then((data) => {
                this.parse360Response(data)
                this.loading.full = false
            })
            .catch((error) => {
                console.error(error)
            })
    }

    parse360Response(data) {
        this.permissions = []
        for (var item of data) {
            const result = item.label.replace(/([A-Z])/g, ' $1')
            const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
            item.name = item.label
            item.label = finalResult
            this.permissions.push(item)
        }
        this.permissions = [...this.permissions]
    }

    getPermissionSetDetails(event) {
        this.loading.specific_permissions = true
        let name = event.target.dataset.key

        if (
            this.selectedPermission &&
            this.template.querySelector(
                "li[data-key='" + this.selectedPermission + "']",
            )
        )
            this.template.querySelector(
                "li[data-key='" + this.selectedPermission + "']",
            ).className = 'slds-item'

        this.template.querySelector("li[data-key='" + name + "']").className =
            'slds-item slds-theme_inverse'

        this.selectedPermission = name
        fetch('/api/permissionset/' + name)
            .then((response) => response.json())
            .then((data) => {
                this.parse360Response(data.totalNumbers)
                this.permissionJson = data.jsonData
                this.loading.specific_permissions = false
                this.getDuplicates(name)
            })
            .catch((error) => {
                console.error(error)
            })
    }

    viewPermissions(event) {

        this.tableHeaders = ['Name'];
        let selectedMetadataType = event.currentTarget.dataset.name


        if(selectedMetadataType.toUpperCase() == 'FIELDPERMISSIONS'){
            this.tableHeaders.push('Read');
            this.tableHeaders.push('Edit');
        }

        if(selectedMetadataType.toUpperCase() == 'OBJECTPERMISSIONS'){
            this.tableHeaders.push('Create');
            this.tableHeaders.push('Read');
            this.tableHeaders.push('Edit');
            this.tableHeaders.push('Delete');
            this.tableHeaders.push('ViewAll');
            this.tableHeaders.push('ModifyAll');
        }

        let type = this.configs[selectedMetadataType]
   
        let metadataList = []
        if (
            !Array.isArray(this.permissionJson.PermissionSet[selectedMetadataType])
        ) {
            metadataList.push(this.permissionJson.PermissionSet[selectedMetadataType])
        } else {
            metadataList = this.permissionJson.PermissionSet[selectedMetadataType]
        }

        this.listItems = []
        for (let item of metadataList) {

            let metadata = {};
            metadata.name = item[type]._text;
            metadata.fieldPermissions = false;
            metadata.objectPermissions = false;

            if(selectedMetadataType.toUpperCase() == 'FIELDPERMISSIONS'){
                  metadata.read = item.readable._text === 'true';
                  metadata.edit = item.editable._text === 'true';
                  metadata.fieldPermissions = true;
            }
            if(selectedMetadataType.toUpperCase() == 'OBJECTPERMISSIONS'){
               
                metadata.create = item.allowCreate._text === 'true';
                metadata.read = item.allowRead._text === 'true';
                metadata.edit = item.allowEdit._text === 'true';
                metadata.delete = item.allowDelete._text === 'true';
                metadata.viewall = item.viewAllRecords._text === 'true';
                metadata.modifyall = item.modifyAllRecords._text === 'true';
                metadata.objectPermissions = true;
          }
            this.listItems.push(metadata)
        }
        this.listItems = [...this.listItems]
        this.selectedMetadata = event.currentTarget.dataset.label
        this.showListItems = true
    }

    searchPermissionSets(event) {
        let searchKey = event.target.value
        for (var item of this.allPermissionSets) {
            if (
                !searchKey ||
                item.name.toUpperCase().includes(searchKey.toUpperCase())
            ) {
                item.visible = true
            } else {
                item.visible = false
            }
        }
        this.allPermissionSets = [...this.allPermissionSets]
    }

    showDuplicatePermissionSets() {
        this.template
            .querySelector('permission360-duplicate')
            .showDuplicateModal(
                this.selectedPermission,
                this.dupObj.duplicates,
                'Duplicate Permission Sets',
            )
    }

    compareAllPermissionSets(event) {
        
        let allPermissionSets = [...this.allPermissionSets];
        allPermissionSets= allPermissionSets.map(a => a.name);
        const index = allPermissionSets.indexOf(this.selectedPermission);
        allPermissionSets.splice(index, 1);

        this.template
            .querySelector('permission360-duplicate')
            .showDuplicateModal(
                this.selectedPermission,
                allPermissionSets,
                'Compare Permissions with ' + this.selectedPermission,
            )
    }

    showSimilarDuplicatePermissionSets() {
        this.template
            .querySelector('permission360-duplicate')
            .showDuplicateModal(
                this.selectedPermission,
                this.dupObj.alreadyCoveredPermissionSets,
                'Similar Permission Sets',
            )
    }

    getDuplicates(psName) {
        this.loading.duplicate = true
        fetch('/api/findduplicates/' + psName)
            .then((response) => response.json())
            .then((data) => {
                this.dupObj = data
                this.loading.duplicate = false
            })
            .catch((error) => {
                this.loading.duplicate = false
                console.error(error)
            })
    }

    get totalDuplicates() {
        if (this.dupObj.duplicates) return this.dupObj.duplicates.length

        return 0
    }

    get totalAlreadyCoveredPermissionSets() {
        if (this.dupObj.alreadyCoveredPermissionSets)
            return this.dupObj.alreadyCoveredPermissionSets.length

        return 0
    }

    get isPermissionSelected() {
        return this.selectedPermission.length > 0
    }

    closeModal() {
        this.showListItems = false
    }
}
