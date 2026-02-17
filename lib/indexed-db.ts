
export async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("ResumeScreeningDB", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("results")) {
        db.createObjectStore("results", { keyPath: "id" });
      }
    };
  });
}

export async function saveScreeningResults(results: any) {
  try {
    const db = await openDB();
    const tx = db.transaction("results", "readwrite");
    const store = tx.objectStore("results");
    await store.put({ id: "last_results", data: results, timestamp: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to save to IndexedDB", error);
    // Fallback to localStorage if IndexedDB fails, but without large data
    const strippedResults = results.map((r: any) => ({ ...r, fileData: undefined }));
    localStorage.setItem("last_screening_results", JSON.stringify(strippedResults));
    return false;
  }
}

export async function getScreeningResults() {
  try {
    const db = await openDB();
    const tx = db.transaction("results", "readonly");
    const store = tx.objectStore("results");
    const request = store.get("last_results");
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get from IndexedDB", error);
    const local = localStorage.getItem("last_screening_results");
    return local ? JSON.parse(local) : null;
  }
}
