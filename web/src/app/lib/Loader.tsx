import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';


const LoaderComponent = ({ children }: any) => {
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        // Show loader on initial load or refresh
        setShowLoader(true);

        // Hide loader after a delay to simulate loading
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 2000); // Adjust the duration of the loader display

        // Cleanup the timer when the component is unmounted
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Detect browser refresh by listening to the beforeunload event
        const handleBeforeUnload = () => {
            setShowLoader(true); // Show loader if a reload is triggered
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            // Clean up the event listener when the component is unmounted
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    if (showLoader) {
        return (
            <Container component="main" maxWidth="sm" sx={{ mt: 2 }}>
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Box
                        component="img"
                        alt="logo"
                        src="/assets/glitched_logo.gif"
                        sx={{
                            maxWidth: '100%', // ensures it doesn’t overflow the container
                            maxHeight: '300px', // adjust as necessary to limit height
                            objectFit: 'contain', // ensures image aspect ratio is maintained
                        }}
                    />
                </Box>
            </Container>
        );
    }

    // Render the main app content after the loader is hidden
    return <>{children}</>;
};

export default LoaderComponent;
