import React from 'react';
import { Box, Button, Divider, Grid2 } from '@mui/material';
import ProductImage from '../components/ImageContainer';
import CustomText from '../types/CustomText';
import _ from 'lodash';
import { utils } from '../Constants/utils';
import { Lock, MessageSquareText, Video } from 'lucide-react';
import { Toolbar } from '../components/Toolbar';



interface ToolbarRenderingProps {
    imageLink: string;
    titleContent: string;
    isIconDisplay?: boolean;
    icons?: { id: string, iconUrl: string }[];
    content?: {
        id: string;
        isDisplay: boolean;
        labelContent: string;
        action?: string;
        shortcut?: string;
        permissions?: string[];
        disabled?: boolean;
    }[];
}

const StaticToolbar = ({
    imageLink,
    titleContent,
    content = [],
}: ToolbarRenderingProps) => {
    let validationCheck : any;
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
                        <CustomText type="H1-SIM">{titleContent}</CustomText>
                        <Grid2 container direction={'row'} gap={2} display={'flex'} alignItems={'center'}>
                            {_.map(content, (item) => {
                                if (_.get(item, 'isDisplay', false)) {
                                    const isDisabled = _.get(item, 'disabled', false) ? 'gray' : 'black';
                                    validationCheck = isDisabled === 'gray' ? true : false
                                    return (
                                        <Grid2 key={item.id} display={'flex'} alignItems={'center'}>
                                            <CustomText
                                                type="Body"
                                                style={{ color: isDisabled, cursor: validationCheck? 'not-allowed': 'pointer' }}
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
                    <MessageSquareText style={{ cursor : validationCheck ? 'pointer' : 'not-allowed' }} />
                    <Grid2 mt={-0.5}><Video style={{ cursor : validationCheck ? 'pointer' : 'not-allowed' }}/></Grid2>
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
