import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const EditableParagraph = (props) => {
  const { onUpdate, value } = props;
  const paragraphEditor = useRef();
  const textContainerRef = useRef(null);

  const [text, setText] = useState(value);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      paragraphEditor.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setText(value);
  }, [value]);

  // used for tracking, whether we should render the 'more' button
  // happens when the text is overflowing (doesnt fit in the container)
  useEffect(() => {
    const textContainer = textContainerRef.current;
    if (textContainer) {
      const isOverflow = textContainer.scrollWidth > textContainer.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, [text, isExpanded]);

  const handleUpdate = (e) => {
    const content = e.target.textContent;
    setText(content);
    onUpdate(content);
    setIsEditing(false);
  };

  const renderEditor = () => (
    <div
      contentEditable
      ref={paragraphEditor}
      style={{ maxHeight: 200, overflowY: 'auto', backgroundColor: 'white' }}
      onBlur={(e) => handleUpdate(e)}
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          handleUpdate(e);
        }
      }}
      suppressContentEditableWarning
    >
      {text}
    </div>
  );

  const renderEditButton = () => <Button style={{ padding: 0 }} type='link' icon={<EditOutlined />} onClick={() => setIsEditing(true)} />;

  const renderEllipsisLink = () => isOverflowing && (
    <Button
      type='link'
      style={{ padding: 0 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? 'less' : 'more'}
    </Button>
  );

  const renderControls = () => (
    <>
      {renderEditButton()}
      {renderEllipsisLink()}
    </>
  );

  const renderContent = () => {
    if (isExpanded) {
      return (
        <>
          <p
            style={{ maxHeight: 200, overflowY: 'auto' }}
          >
            {text}
          </p>
          {renderControls()}
        </>
      );
    }

    return (
      <div style={{ display: 'flex' }}>
        <div
          ref={textContainerRef}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingTop: '0.25em',
          }}
        >
          {text}
        </div>
        {renderControls()}
      </div>
    );
  };

  if (isEditing) return renderEditor();
  return renderContent();
};

EditableParagraph.propTypes = {
  value: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditableParagraph;
