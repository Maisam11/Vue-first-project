<template>
    <div class="document-editor-container">
        <file-toolbar-menu
            class="editor-toolbar"
            :content="toolbarContent"
        />
        <input
            ref="importInput"
            type="file"
            accept=".doc,.docx"
            style="display:none"
            @change="handleImport"
        />
        <vue-document-editor
            ref="editor"
            :content.sync="content"
            page_margins="20mm 28mm"
            class="paged-editor"
        />
    </div>
</template>
<script>
import VueDocumentEditor from 'vue-document-editor'
import FileToolbarMenu from 'vue-file-toolbar-menu'
import mammoth from 'mammoth'

export default {
  name: 'DocumentEditor',
  components: {
    VueDocumentEditor,
    FileToolbarMenu
  },
  props: {
    value: {
      type: Array,
      default: () => ['<p><br></p>']
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      toolbarContent: [
                { icon: 'undo', title: 'Undo', click: () => this.exec('undo') },
                { icon: 'redo', title: 'Redo', click: () => this.exec('redo') },
                { is: "separator" },
                { text: 'New', title: 'New document', click: () => (this.content = ['<p><br></p>']) },
                { icon: 'print', title: 'Print', click: () => window.print() },
                { icon: 'download', title: 'Download HTML', click: this.downloadHtml },
                { icon: 'upload_file', title: 'Import Document', click: () => this.$refs.importInput.click() },
                { is: "separator" },
                { text: 'Font Family', menu: [
                    { text: 'Arial', click: () => this.exec('fontName', 'Arial') },
                    { text: 'Avenir', click: () => this.exec('fontName', 'Avenir') },
                    { text: 'Roman', click: () => this.exec('fontName', 'Times New Roman') },
                    { text: 'Courier', click: () => this.exec('fontName', 'Courier New') },
                    { text: 'Georgia', click: () => this.exec('fontName', 'Georgia') }
                ]},
                { text: 'Size', menu: [
                    { text: '10px', click: () => this.exec('fontSize', 1) },
                    { text: '12px', click: () => this.exec('fontSize', 2) },
                    { text: 'Default', click: () => this.exec('fontSize', 3) },
                    { text: '18px', click: () => this.exec('fontSize', 4) },
                    { text: '24px', click: () => this.exec('fontSize', 5) },
                    { text: '32px', click: () => this.exec('fontSize', 6) },
                    { text: '48px', click: () => this.exec('fontSize', 7) }
                ]},
                { text: 'Headings', menu: [
                    { text: 'Heading 1', click: () => document.execCommand('formatBlock', false, 'h1') },
                    { text: 'Heading 2', click: () => document.execCommand('formatBlock', false, 'h2') },
                    { text: 'Heading 3', click: () => document.execCommand('formatBlock', false, 'h3') },
                    { html: 'Heading 4', click: () => document.execCommand('formatBlock', false, 'h4') },
                    { html: 'Heading 5', click: () => document.execCommand('formatBlock', false, 'h5') },
                    { html: 'Heading 6', click: () => document.execCommand('formatBlock', false, 'h6') },
                ]},
                { is: "separator" },
                { icon: 'format_bold', title: 'Bold', click: () => this.exec('bold') },
                { icon: 'format_italic', title: 'Italic', click: () => this.exec('italic') },
                { icon: 'format_underlined', title: 'Underline', click: () => this.exec('underline') },
                { icon: 'strikethrough_s', title: 'Strike', click: () => this.exec('strikeThrough') },
                { is: "separator" },
                { icon: 'format_color_text', title: 'Text Color', menu: [
                    { text: 'Black', click: () => this.exec('foreColor', '#666666') },
                    { text: 'Blue', click: () => this.exec('foreColor', 'blue') },
                    { text: 'Green', click: () => this.exec('foreColor', 'green') },
                    { text: 'Red', click: () => this.exec('foreColor', 'red') },
                ]},
                { icon: 'brush', title: 'Highlight', menu: [
                    { text: 'White', click: () => this.exec('hiliteColor', 'white') },
                    { text: 'Yellow', click: () => this.exec('hiliteColor', 'yellow') },
                    { text: 'Sky', click: () => this.exec('hiliteColor', 'cyan') },
                    { text: 'Pink', click: () => this.exec('hiliteColor', 'pink') },
                ]},
                { is: "separator" },
                { icon: 'link', title: 'Insert Link', click: this.insertLink },
                { icon: 'image', title: 'Insert Image', click: this.insertImage },
                { is: "separator" },
                { icon: 'format_list_bulleted', title: 'Bulleted List', click: () => this.exec('insertUnorderedList') },
                { icon: 'format_list_numbered', title: 'Numbered List', click: () => this.exec('insertOrderedList') },
                { is: "separator" },
                { icon: 'format_align_left', title: 'Align Left', click: () => this.exec('justifyLeft') },
                { icon: 'format_align_center', title: 'Align Center', click: () => this.exec('justifyCenter') },
                { icon: 'format_align_right', title: 'Align Right', click: () => this.exec('justifyRight') },
            ]
        }
    },
    computed: {
    content: {
      get() {
        if (!this.value || !Array.isArray(this.value)) {
          return ['<p><br></p>'];
        }
        return this.value;
      },
      set(newValue) {
        const contentToEmit = Array.isArray(newValue) ? newValue : [newValue];
        this.$emit('input', contentToEmit);
      }
    }
  },
    methods: {
    exec(command, value = null) {
      document.execCommand(command, false, value)
      this.$nextTick(() => {
        const editable = this.$el.querySelector('.vue-document-editor-editable')
        if (editable) editable.focus()
      })
    },
    async handleImport(e) {
      const file = e.target.files[0]
      e.target.value = ''
      if (!file) return
      const extension = file.name.split('.').pop().toLowerCase()
      if (extension === 'doc') {
        await this.importDoc(file)
      } else if (extension === 'docx') {
        await this.importDocx(file)
      } else {
        alert('Unsupported file type')
      }
    },
    async importDoc(file) {
      const html = await file.text()
      const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      this.content = [match ? match[1] : '<p><br></p>']
    },
    async importDocx(file) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        this.content = [result.value || '<p><br></p>']
      } catch (err) {
        console.error(err)
        alert('Failed to import DOCX file')
      }
    },
    downloadHtml() {
      const html = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-size: 12pt;
              }
              p {
                margin: 0 0 0.3cm 0;
              }
            </style>
          </head>
          <body>
            ${this.content.join('\n')}
          </body>
        </html>`
      const blob = new Blob([html], { type: 'text/html' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'document.doc'
      link.click()
      URL.revokeObjectURL(link.href)
    },
  }
}
</script>
<style scoped>
.editor-toolbar {
  margin-bottom: 10px;
  background: #F0F4F9;
  padding: 4px 4px 4px 10px;
  border-radius: 20px;
}
.paged-editor {
  background: #F9FBFD;
}
.editor-toolbar :deep(.bar-button .material-icons) {
  font-size: 18px !important;
}
.editor-toolbar :deep(.bar-button) {
  font-size: 15px;
}
.editor-toolbar :deep(.bar-button:hover) {
  cursor: pointer;
  outline: 1px solid #93959925;
}
.editor-toolbar :deep(.bar-button:active) {
  background-color: #D3E3FD !important;
  color: #1976d2 !important;
}
.paged-editor :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: auto;
}
</style>