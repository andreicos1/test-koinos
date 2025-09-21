Backend

1. Using async when reading files to avoid blocking the main thread. This way the server can process other incoming requests.
2. stats.js Performance -> Serving a cached stats results, and watching file changes to only re-calculate stats when the items.json file changes

Frontend

1. Move the setItems logic away from the context, allow consumer to call it
2. Added pagination & Search
3. Implemented react window

Others

1. Temporarily removed errorHandler due to performance issues (it was spinning up infinite terminals on my machine, I didn't manage to find out why in the 45m)
2. Fixed items page was not calling the correct API URL
