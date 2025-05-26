chrome.downloads.onChanged.addListener(function (delta) {

   
    
   // console.log("Download changed event fired:", delta);
  
    if (delta.state && delta.state.current === 'complete') {
      //console.log("Download completed, searching for file info...");
  
      chrome.downloads.search({ id: delta.id }, function (results) {
        const download = results[0];
       // console.log("Download path:", download.filename);
  
        fetch("http://localhost:3000/scan", {
          method: "POST",
          body: JSON.stringify({ filePath: download.filename }),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json())
          .then(data => console.log("Scan result:", data))
          .catch(err => console.error("Fetch error:", err));
      });
    }
  });
  