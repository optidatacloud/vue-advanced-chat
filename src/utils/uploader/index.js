// import { translate } from '../i18n'

window.Optidata = window.Optidata || {}

export default class FileManagerUploader {
  constructor() {
    this.active = true

    this.initEventListeners = () => {
      console.log(`initEventListeners`)

      document.body.addEventListener('drop', this.onDrop.bind(this))
      document.body.addEventListener('dragenter', this.onDrag.bind(this))
      document.body.addEventListener('dragleave', this.onDrag.bind(this))
      document.body.addEventListener('dragover', this.onDragOver.bind(this))
    }

    this.onDrop = async (event) => {
      console.log(event.target, 'onDrop')

      if (!this.active) return

      event.preventDefault()
      this.removeDragOverlay()

      // const targetFolder = event.target.closest('.file-manager-item.folder')
    }

    this.onDragOver = event => {
      console.log(event.target, 'onDragOver')
      event.preventDefault()
    }

    this.onDrag = event => {
      console.log(event.target, 'onDrag')

      if (!this.active) return

      event.preventDefault()

      const dragOverlay = $('.vac-drag-overlay')
      const target = $(event.relatedTarget)

      if (event.type === 'dragenter' && dragOverlay.length === 0) {
        this.addDragOverlay()
        return
      }

      if (event.type === 'dragleave' && target.closest('body').length === 0) {
        this.removeDragOverlay()
      }
    }

    this.addDragOverlay = () => {
      const chat = $('#teste')
      chat.removeClass('d-none')

      //   chat.append(`
      //     <div class="drag-overlay">
      //       <div class="drag-overlay-indicator rounded text-light text-center">
      //         <i class="fas fa-file-upload fs-3 me-50"></i>
      //         <span class="fs-3 text">${translate('Drop the files to upload')}</span>
      //         <div class="row">
      //           <span class="fs-5 text-opacity-75">${translate('Tip: you can drop into a folder to choose the destination')}</span>
      //         </div>
      //       </div>
      //     </div>
      // `)

      // const indicator = chat.find('.drag-overlay-indicator')
      // indicator.animate({ bottom: '+=50px' }, 200, 'linear')
      console.log(chat)
    }

    this.removeDragOverlay = () => {
      const chat = $('#teste')
      chat.addClass('d-none')

      // chat.removeClass('vac-drag-overlay-border')

      // const dragOverlay = body.find('.drag-overlay')

      // dragOverlay.remove()
      console.log(chat)
    }

    this.activate = () => {
      this.active = true
    }

    this.deactivate = () => {
      this.active = false
    }
  }
}

window.Optidata.FileManagerUploader = new FileManagerUploader()
