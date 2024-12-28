import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';

const ErrorModal = ({ open, message, onClose }) => {
    // Пытаемся найти JSON в сообщении об ошибке
    let mainMessage = message;
    let jsonContent = null;

    try {
        // Ищем начало JSON в сообщении
        const jsonStart = message?.indexOf('{');
        if (jsonStart !== -1) {
            mainMessage = message.substring(0, jsonStart).trim();
            const jsonString = message.substring(jsonStart);
            const jsonData = JSON.parse(jsonString);
            jsonContent = JSON.stringify(jsonData, null, 2);
        }
    } catch (e) {
        // Если не удалось распарсить JSON, оставляем сообщение как есть
        console.error('Failed to parse error JSON:', e);
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'error.main' }}>Ошибка</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>{mainMessage}</Typography>
                {jsonContent && (
                    <Box 
                        sx={{ 
                            mt: 2, 
                            p: 2, 
                            backgroundColor: 'grey.100', 
                            borderRadius: 1,
                            fontFamily: 'monospace'
                        }}
                    >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {jsonContent}
                        </pre>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ErrorModal; 