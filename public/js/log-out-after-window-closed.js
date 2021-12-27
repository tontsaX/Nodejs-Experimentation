(() => {
  window.addEventListener('beforeunload', (event) => {
    const eventRef = event;
    navigator.sendBeacon('/game-of-ur/logout');
    // Some browsers may require event to return a string. -MDN Web Docs
    eventRef.returnValue = '';
  });
})();
