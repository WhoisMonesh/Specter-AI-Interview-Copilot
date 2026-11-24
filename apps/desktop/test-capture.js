const { app, desktopCapturer } = require('electron');
app.whenReady().then(async () => {
  try {
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 400, height: 300 } });
    console.log("Found screen sources:", sources.length, sources.map(s => s.name));
    if (sources.length > 0) {
      console.log("Thumbnail data length:", sources[0].thumbnail.toDataURL().length);
    }
  } catch (err) {
    console.error("Capture error:", err);
  }
  app.quit();
});
