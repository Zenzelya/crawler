
let cvsFile;
let DB;
const settingsDB = {
    name : 'CrawlerDatabase',
    idbSupported : false,
    currentVersion: 1,
    store: 'https://www.flipkart.com/'
};

createObjectStore(settingsDB.store);

$( document ).ready(function() {
    document.getElementById('upload').addEventListener('change', readFileAsString)
    if("indexedDB" in window) {
        settingsDB.idbSupported = true;
    }

    if(settingsDB.idbSupported) {
        const openRequest = indexedDB.open(settingsDB.name, settingsDB.currentVersion);

        openRequest.onupgradeneeded = function(e) {
            console.log("Upgrading...");
        };

        openRequest.onsuccess = function(e) {
            DB = e.target.result;
            console.log("Success!", DB.version );
        };

        openRequest.onerror = function(e) {
            console.log("Error");
            console.dir(e);
        };
    }
});

function createObjectStore( storeName ){

    let openRequest = indexedDB.open(settingsDB.name, settingsDB.currentVersion);
    openRequest.onupgradeneeded = function() {
        let thisDB = openRequest.result;
        if (!thisDB.objectStoreNames.contains(storeName)) {
            thisDB.createObjectStore(storeName);
        }
        thisDB.close();
    };
}

function deleteObjectStore(storeName){
    let openRequest = indexedDB.open(settingsDB.name, settingsDB.currentVersion);
    openRequest.onupgradeneeded = function(event) {
        const thisDB = event.target.result;
        thisDB.deleteObjectStore(storeName);
        console.log('try to delete', storeName);

    };

    openRequest.onerror = function(e) {
        console.log("Error");
        console.dir(e);
    }
}

function setVersion(newVersion){
    settingsDB.currentVersion = newVersion;
}

function loadObjectStoreFromJSON(storeName, payload){
    let openRequest = indexedDB.open(settingsDB.name);
    openRequest.addEventListener('error', (event) => {
        console.log('Request error:', openRequest.error);
    });

    openRequest.onsuccess = function(e) {
        console.log("Success!");
        const thisDB = openRequest.result;
        if(thisDB.objectStoreNames.contains(storeName)) {
            const transaction = thisDB.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            payload.forEach( (item, index) => {
                store.add(item, index);
            })
        }
        thisDB.close();
    }
}

function readFileAsString() {
    const files = this.files;
    if (files.length === 0) {
        console.log('No file is selected');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        processData(event.target.result)
    };
    reader.readAsText(files[0]);
}

function processData(allText) {
    cvsFile = $.csv.toObjects(allText);
    loadObjectStoreFromJSON(settingsDB.store, cvsFile);
}



