import React, { useState } from 'react';
import { Tooltip } from '@mui/material';

const TruncatedText = ({ text, maxLength = 40 }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!text || text.length <= maxLength) {
        return text;
    }

    const truncated = text.substring(0, maxLength - 3) + '...';

    return (
        <Tooltip title={text} open={isHovered}>
            <span 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ cursor: 'pointer' }}
            >
                {truncated}
            </span>
        </Tooltip>
    );
};

export default TruncatedText; 