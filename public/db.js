let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("budgetStore", {
        autoIncrement: true
    });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDB();
    }
};

request.onerror = function (event) {
    console.log("Sorry error " + event.target.errorCode + "!");
};

function saveTransaction(record) {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const storage = transaction.objectStore("budgetStore");
    storage.add(record);
}

function checkDB() {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const storage = transaction.objectStore("budgetStore");
    const getAll = storage.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["budgetStore"], "readwrite");
                    const storage = transaction.objectStore("budgetStore");
                    storage.clear();
                });
        }
    };
}

window.addEventListener("online", checkDB);