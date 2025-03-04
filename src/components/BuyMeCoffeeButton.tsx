
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

interface BuyMeCoffeeButtonProps {
  username: string;
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
}

const BuyMeCoffeeButton = ({
  username,
  variant = "outline",
  showText = true
}: BuyMeCoffeeButtonProps) => {
  const buyMeCoffeeUrl = `https://www.buymeacoffee.com/${username}`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={variant}
        size="sm"
        className="gap-2"
        onClick={() => window.open(buyMeCoffeeUrl, '_blank')}
      >
        <Coffee className="h-4 w-4" />
        {showText && <span>Buy me a coffee</span>}
      </Button>
    </motion.div>
  );
};

export default BuyMeCoffeeButton;
