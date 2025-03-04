
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/ChatInterface";
import { ChatProvider } from "@/context/ChatContext";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <ChatProvider>
        <div className="min-h-screen overflow-hidden relative bg-mesh-light">
          <motion.div 
            className="fixed inset-0 pointer-events-none z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-mesh-light" />
          </motion.div>
          
          <Navbar />
          <main className="min-h-screen flex flex-col">
            <ChatInterface />
          </main>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
