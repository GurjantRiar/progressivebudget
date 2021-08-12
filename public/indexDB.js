let database;
const request = indexedDB.open("budget", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  database.createObjectStore("pending", { autoIncrement: true });
};
request.onsucess = function (event) {
  database = event.target.result;
  if (navigator.online) {
    checkDatabase();
  }
};
request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}

function checkDatabase() {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // delete records if successful
          const transaction = database.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
// function deletePending() {
//   const transaction = database.transaction(["pending"], "readwrite");
//   const store = transaction.objectStore("pending");
//   store.clear();
// }

// listen for app coming back online
window.addEventListener("online", checkDatabase);
