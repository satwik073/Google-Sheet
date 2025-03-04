
export const GOOGLE_SHEETS_CONSTANT = {
  static_toolbar_config : [
    {
      id: 'file',
      isDisplay: true,
      labelContent: 'File',
      tooltip: 'Manage file operations such as opening, saving, and exporting.',
      icon: 'file',
      action: 'openFile',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+F',
      subMenu: [],
    },
    {
      id: 'edit',
      isDisplay: true,
      labelContent: 'Edit',
      tooltip: 'Modify your document with options like undo, redo, and cut.',
      icon: 'edit',
      action: 'editDocument',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor', 'viewer'],
      shortcut: 'Ctrl+E',
      subMenu: [],
    },
    {
      id: 'view',
      isDisplay: true,
      labelContent: 'View',
      tooltip: 'Adjust the view settings such as zoom and layout.',
      icon: 'view',
      action: 'viewSettings',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+V',
      subMenu: [],
    },
    {
      id: 'insert',
      isDisplay: true,
      labelContent: 'Insert',
      tooltip: 'Insert elements like text boxes, images, and charts.',
      icon: 'insert',
      action: 'insertElement',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+I',
      subMenu: [],
    },
    {
      id: 'format',
      isDisplay: true,
      labelContent: 'Format',
      tooltip: 'Change the appearance of your document with styles and themes.',
      icon: 'format',
      action: 'formatDocument',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+Shift+F',
      subMenu: [],
    },
    {
      id: 'data',
      isDisplay: true,
      labelContent: 'Data',
      tooltip: 'Perform data-related tasks such as sorting, filtering, and analysis.',
      icon: 'data',
      action: 'dataAnalysis',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+Shift+D',
      subMenu: [],
    },
    {
      id: 'tools',
      isDisplay: true,
      labelContent: 'Tools',
      tooltip: 'Access advanced tools and utilities.',
      icon: 'tools',
      action: 'advancedTools',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin'],
      shortcut: 'Ctrl+T',
      subMenu: [],
    },
    {
      id: 'extensions',
      isDisplay: true,
      labelContent: 'Extensions',
      tooltip: 'Manage third-party extensions and plugins.',
      icon: 'extensions',
      action: 'manageExtensions',
      disabled: true,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin'],
      shortcut: 'Ctrl+E',
      subMenu: [],
    },
    {
      id: 'help',
      isDisplay: true,
      labelContent: 'Help',
      tooltip: 'Get assistance with common issues and tutorials.',
      icon: 'help',
      action: 'openHelp',
      disabled: false,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor', 'viewer'],
      shortcut: 'F1',
      subMenu: [],
    },
    {
      id: 'save',
      isDisplay: true,
      labelContent: 'Save',
      tooltip: 'Save your work to avoid losing any progress.',
      icon: 'save',
      action: 'saveDocument',
      disabled: false,
      customStyles: { backgroundColor: '#f0f0f0', color: '#333' },
      permissions: ['admin', 'editor'],
      shortcut: 'Ctrl+S',
      subMenu: [],
    },
  ]
}
