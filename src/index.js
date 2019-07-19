// app inicia Electon, BrowserWindow crea la pantalla principal, Menu son las opciones del programa
const {app, BrowserWindow, Menu, ipcMain} = require('electron')

const path = require('path')
const url = require('url')

if(process.env.NODE_ENV !== 'production'){
    // Indicamos con __dirname que chequee los cambios dentro de la carpeta src y por {} le indicamos que también chequee cambios en electron
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    })
}

// Pantalla principal
let mainWindow
// Pantalla de crear producto
let newProductWindow

// Esto se inicia al estar 'ready', con el path busca la carpeta src y ejecuta el index.html como pantalla principal
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }))
    // al cerrar el mainWindow cierra todas las pantallas abiertas
    mainWindow.on('closed', () => {
        app.quit()
    })
    // Opciones del menu superior del programa, se le pasa la const templateMenu para ser mas prolijo y con el set se le asigna el nuevo Menu
    const mainMenu = Menu.buildFromTemplate(templateMenu)
    Menu.setApplicationMenu(mainMenu)

})

// Funcion para abrir pantalla de crear producto
function createANewProductWindow(){
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 330,
        title: "Add A New Product",
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    })
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }))
    // elimina el menu superior en la ventana abierta
    newProductWindow.setMenu(null)
}

// Obtenemos los datos de new-product.html y los enviamos al index.html
ipcMain.on('product:new', (e, newProduct) => {
    // console.log(newProduct) podemos chequear que los valores son los correctos

    // Se envía por mainWindow con webContents los datos obtenidos y luego cerramos la pantalla newProductWindow 
    mainWindow.webContents.send('product:new', newProduct);
    newProductWindow.close();
})

const templateMenu = [
    {
        label: "File",
        submenu: [
            {
                label: "New Product",
                accelerator: process.platform === 'darwin' ? "cmd+N" : "Ctrl+N",
                click(){
                    createANewProductWindow()
                }
            },
            {
                label: "Remove All Product's",
                click(){
                    mainWindow.webContents.send('products:remove-all')
                }
            },
            {
                label: "Exit",
                accelerator: process.platform === 'darwin' ? "cmd+Q" : "Ctrl+Q",
                click(){
                    app.quit()
                }
            },
        ]
    }
]
if(process.platform === 'darwin'){
    templateMenu.unshift({
        label: app.getName()
    })
}
if(process.env.NODE_ENV !== 'production'){
    templateMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: "Show/Hide Dev Tools",
                accelerator: process.platform === 'darwin' ? "cmd+D" : "Ctrl+D",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'Reload'
            }
        ]
    })
}