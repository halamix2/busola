import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Bar, Button, Dialog, Title } from '@ui5/webcomponents-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

import './Modal.scss';

Modal.propTypes = {
  title: PropTypes.any,
  modalOpeningComponent: PropTypes.any.isRequired,
  onShow: PropTypes.func,
  actions: PropTypes.any,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.string,
  disabledConfirm: PropTypes.bool,
  waiting: PropTypes.bool,
  tooltipData: PropTypes.object,
  className: PropTypes.string,
  headerActions: PropTypes.object,
};

Modal.defaultProps = {
  title: 'components.modal.title',
  confirmText: 'components.modal.confirm-text',
  actions: null,
  type: 'default',
  disabledConfirm: false,
  waiting: false,
};

export function Modal({
  title,
  actions,
  modalOpeningComponent,
  onShow,
  onHide,
  onConfirm,
  confirmText,
  cancelText,
  type,
  disabledConfirm,
  waiting,
  tooltipData,
  children,
  className,
  disableAutoClose = true,
  headerActions,
}) {
  const { t } = useTranslation();
  const [show, setShow] = React.useState(false);
  function onOpen() {
    if (onShow) {
      onShow();
    }
    setShow(true);
  }

  function onClose() {
    if (onHide) {
      onHide();
    }
    setShow(false);
  }

  async function handleConfirmClicked() {
    if (onConfirm) {
      const result = await onConfirm();
      // check if confirm is not explicitly cancelled
      if (result !== false) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  const createActions = () => {
    const confirmMessage = waiting ? (
      <div style={{ width: '97px', height: '16px' }}>
        <Spinner />
      </div>
    ) : (
      t(confirmText)
    );

    const confirmButton = (
      <Button
        design="Emphasized"
        onClick={handleConfirmClicked}
        disabled={disabledConfirm}
        data-e2e-id="modal-confirmation-button"
      >
        {confirmMessage}
      </Button>
    );
    let output = [
      tooltipData ? (
        <Tooltip {...tooltipData} minWidth={tooltipData.minWidth || '191px'}>
          {confirmButton}
        </Tooltip>
      ) : (
        confirmButton
      ),
    ];

    if (cancelText) {
      output.push(
        <Button
          style={{ marginRight: '12px' }}
          design="Transparent"
          onClick={onClose}
        >
          {cancelText}
        </Button>,
      );
    }

    return output;
  };

  const modalActions = () => {
    if (typeof actions === 'function') return actions(onClose);
    return actions || createActions();
  };

  return (
    <>
      <div style={{ display: 'contents' }} onClick={onOpen}>
        {modalOpeningComponent}
      </div>
      {createPortal(
        <Dialog
          className={classNames('custom-modal', className)}
          type={type}
          headerText={title}
          header={
            headerActions ? (
              <Bar
                startContent={<Title level="H5">{title}</Title>}
                endContent={headerActions}
              />
            ) : null
          }
          open={show}
          onAfterClose={onClose}
          actions={modalActions()}
        >
          {children}
          <Bar design="footer" slot="footer" endContent={modalActions()} />
        </Dialog>,
        document.body,
      )}
    </>
  );
}
