import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Input, Space, Tooltip, Typography,
} from 'antd';

import {
  EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';

import integrationTestConstants from 'utils/integrationTestConstants';

const { Text } = Typography;

const EditableField = (props) => {
  const {
    value,
    deleteEnabled,
    showEdit,
    onAfterSubmit,
    onAfterCancel,
    renderBold,
    defaultEditing,
    validationFunc,
    onEditing,
    formatter,
    isDisabled,
    message,
    onDelete,
  } = props;

  const [editing, setEditing] = useState(defaultEditing);
  const [editedValue, setEditedValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const saveButton = useRef(null);
  const editButton = useRef(null);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  useEffect(() => {
    if (!onEditing) return;

    onEditing(editing);
  }, [editing]);

  const deleteEditableField = (e) => {
    e.stopPropagation();
    onDelete(e, editedValue);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(e);
    }

    if (e.key === 'Escape') {
      onCancel(e);
    }
  };

  const onChange = (e) => {
    const { value: newValueRaw } = e.target;
    const newValue = formatter(newValueRaw);

    if (validationFunc) {
      const valid = value === newValue || validationFunc(newValue);

      // Validation func may not return false on invalid
      setIsValid(valid === true);
    }

    setEditedValue(newValue);
  };

  const onSubmit = (e) => {
    e.stopPropagation();

    if (!isValid) return null;

    onAfterSubmit(editedValue);
    toggleEditing(e);
  };

  const onCancel = (e) => {
    e.stopPropagation();
    if (!isValid) setIsValid(true);
    setEditedValue(value);
    toggleEditing(e);
    onAfterCancel();
  };

  const toggleEditing = (e) => {
    e.stopPropagation();
    setEditing(!editing);
  };

  const renderEditState = () => {
    if (editing) {
      return (
        <>
          <Input
            data-testid='editableFieldInput'
            aria-label='Input'
            autoFocus
            onChange={onChange}
            onClick={(e) => e.stopPropagation()}
            size='small'
            draggable
            defaultValue={editedValue}
            onKeyDown={onKeyDown}
          />

          <Tooltip placement='top' title='Save' mouseLeaveDelay={0} ref={saveButton}>
            <Button
              aria-label='Save'
              size='small'
              shape='circle'
              icon={<CheckOutlined />}
              onClick={(e) => {
                saveButton.current.onMouseLeave();
                onSubmit(e);
              }}
            />
          </Tooltip>

          <Tooltip placement='top' title='Cancel' mouseLeaveDelay={0}>
            <Button aria-label='Cancel' size='small' shape='circle' icon={<CloseOutlined />} onClick={onCancel} />
          </Tooltip>

        </>
      );
    }

    return (
      <>
        {renderBold ? <strong>{value}</strong> : <span>{value}</span>}
        {
          showEdit
            ? (
              <Tooltip placement='top' title={message} mouseLeaveDelay={0} ref={editButton}>
                <Button
                  disabled={isDisabled}
                  aria-label='Edit'
                  size='small'
                  shape='circle'
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    editButton.current.onMouseLeave();
                    toggleEditing(e);
                  }}
                />
              </Tooltip>
            ) : <></>
        }
      </>
    );
  };

  return (
    <>
      <Space direction='vertical'>
        <Space align='start'>
          {renderEditState()}
          {
            deleteEnabled
              ? (
                <Tooltip placement='top' title={message} mouseLeaveDelay={0}>
                  <Button
                    disabled={isDisabled}
                    data-test-class={integrationTestConstants.classes.EDITABLE_FIELD_DELETE_BUTTON}
                    aria-label='Delete'
                    size='small'
                    shape='circle'
                    icon={<DeleteOutlined />}
                    onClick={deleteEditableField}
                  />
                </Tooltip>
              ) : <></>
          }
        </Space>
        {!isValid ? (
          <Text type='danger' style={{ fontSize: 12, fontWeight: 600 }}>
            {validationFunc(editedValue) === false ? 'Invalid input' : validationFunc(editedValue)}
          </Text>
        ) : <></>}
      </Space>
    </>
  );
};

EditableField.defaultProps = {
  onAfterSubmit: () => null,
  onAfterCancel: () => null,
  onDelete: () => null,
  onEditing: undefined,
  validationFunc: undefined,
  renderBold: false,
  value: null,
  showEdit: true,
  deleteEnabled: true,
  defaultEditing: false,
  isDisabled: false,
  message: 'Edit',
  formatter: (value) => value,
};

EditableField.propTypes = {
  value: PropTypes.string,
  onAfterSubmit: PropTypes.func,
  onAfterCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onEditing: PropTypes.func,
  validationFunc: PropTypes.func,
  deleteEnabled: PropTypes.bool,
  showEdit: PropTypes.bool,
  renderBold: PropTypes.bool,
  defaultEditing: PropTypes.bool,
  isDisabled: PropTypes.bool,
  message: PropTypes.string,
  formatter: PropTypes.func,
};

export default EditableField;
