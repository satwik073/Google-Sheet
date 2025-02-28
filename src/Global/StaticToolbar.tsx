import React, { useState, useEffect } from 'react';
import { Grid2 } from '@mui/material';
import ProductImage from '../components/ImageContainer';
import CustomText from '../types/CustomText';
import _ from 'lodash';
import { utils } from '../Constants/utils';
import { MessageSquareText, Video } from 'lucide-react';

interface ToolbarRenderingProps {
  imageLink: string;
  titleContent: string;
  isIconDisplay?: boolean;
  icons?: { id: string, iconUrl: string }[];
  isSaveDisabled? : boolean,
  content?: {
    id: string;
    isDisplay: boolean;
    labelContent: string;
    action?: string;
    shortcut?: string;
    permissions?: string[];
    disabled?: boolean;
  }[];
  onSave?: () => void; 
}

const StaticToolbar = ({
  imageLink,
  titleContent,
  content = [],
  isIconDisplay = false,
  isSaveDisabled = false,
  onSave
}: ToolbarRenderingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(titleContent);
  let validationCheck: any;

  // Load title from localStorage on initial render
  useEffect(() => {
    const savedTitle = localStorage.getItem('spreadsheetTitle');
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  // Handle double-click to enable editing
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle saving the title
  const handleTitleSave = () => {
    setIsEditing(false);
    // Save to localStorage
    localStorage.setItem('spreadsheetTitle', title);
  };

  // Handle keyboard events (save on Enter, cancel on Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      // Restore original value from localStorage
      const savedTitle = localStorage.getItem('spreadsheetTitle');
      if (savedTitle) {
        setTitle(savedTitle);
      } else {
        setTitle(titleContent);
      }
    }
  };

  // Handle item click based on action
  const handleItemClick = (action: string | undefined) => {
    if (!action) return;
    
    // Call the appropriate function based on the action
    if (action === 'saveDocument' && onSave) {
      onSave();
    }
    // Add other action handlers as needed
  };

  return (
    <Grid2 bgcolor={'#f9fbfd'}>
      <Grid2 container display={'flex'} direction={'row'} justifyContent={'space-between'} alignItems={'center'} bgcolor={'#f9fbfd'} p={2}>
        <Grid2 display={'flex'} gap={0.5} alignItems={'center'}>
          <ProductImage
            ImageSource={imageLink}
            Dimensions={{ Height: 45, Width: 45 }}
            AlternateText="Product Image"
            Layout="FIXED"
          />
          <Grid2>
            {isEditing ? (
              <input
                type="text"
                value={title || 'Untitled Spreadsheet'}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className='border'
                style={{
                  fontSize: '20px',
                  borderRadius: '4px',
                  width: 'fit-content'
                }}
              />
            ) : (
              <CustomText 
                type="H1-SIM" 
                onDoubleClick={handleDoubleClick}
                style={{ cursor: 'pointer' }}
              >
                {title}
              </CustomText>
            )}
            <Grid2 container direction={'row'} gap={2} display={'flex'} alignItems={'center'}>
              {_.map(content, (item) => {
                if (_.get(item, 'isDisplay', false)) {
                  const isDisabled = _.get(item, 'disabled', false) ? 'gray' : 'black';
                  validationCheck = isDisabled === 'gray' ? true : false;
                  return (
                    <Grid2 key={item.id} display={'flex'} alignItems={'center'}>
                      <CustomText
                        type="Body"
                        style={{ 
                          color: isDisabled, 
                          cursor: validationCheck ? 'not-allowed' : 'pointer' 
                        }}
                        onClick={() => !validationCheck && handleItemClick(item.action)}
                      >
                        {_.get(item, 'labelContent', '')}
                      </CustomText>
                    </Grid2>
                  );
                }
                return null;
              })}
            </Grid2>
          </Grid2>
        </Grid2>
        <Grid2 display={'flex'} gap={3} alignItems={'center'}>
          <MessageSquareText style={{ cursor: validationCheck ? 'pointer' : 'not-allowed' }} />
          <Grid2 mt={-0.5}><Video style={{ cursor: validationCheck ? 'pointer' : 'not-allowed' }} /></Grid2>
          <Grid2
            p={3}
            bgcolor={'#0D4715'}
            borderRadius={'50%'}
            width={50}
            color={'#FFF'}
            height={50}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {utils?.get_initial_contents('Satwik Kanhere')}
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default StaticToolbar;