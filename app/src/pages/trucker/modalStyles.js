export const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '600px',
    width: '90%',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'var(--modal-bg, #ffffff)',
    border: 'none',
    maxHeight: '90vh',
    overflow: 'auto'
  }
}; 