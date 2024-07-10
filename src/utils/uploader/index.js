// import { translate } from '../i18n'

window.Optidata = window.Optidata || {}

export default class FileManagerUploader {
  constructor() {
    this.active = true

    this.initEventListeners = () => {
      document.body.addEventListener('drop', this.onDrop.bind(this))
      document.body.addEventListener('dragenter', this.onDrag.bind(this))
      document.body.addEventListener('dragleave', this.onDrag.bind(this))
    }

    this.onDrop = async event => {
      event.preventDefault()
      this.removeDragOverlay()
    }

    this.onDrag = event => {
      event.preventDefault()

      switch (event.type) {
      case 'dragenter':
        this.addDragOverlay()
        break
      case 'dragleave':
        this.removeDragOverlay()
        break

      default:
        break
      }
    }

    this.addDragOverlay = () => {
      const chat = $('#chat')

      chat.prepend(`
        
        <div id='vac-overlay'>
          <div class="vac-drag-overlay-border"></div>
          <div class='vac-drag-overlay'>
            <div class='vac-drag-overlay-indicator'>
              <span class='vac-drag-overlay-title'>Drop the files to send</span>

              <div>
                <span>Tip: you can drop multiple files at once</span>
              </div>
            </div>
          </div>
        </div>
      `)
    }

    this.removeDragOverlay = () => {
      document.getElementById('vac-overlay').remove()
    }
  }
}

window.Optidata.FileManagerUploader = new FileManagerUploader()
