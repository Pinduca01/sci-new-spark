import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TAFModal from './TAFModal';

const TAFForm = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Novo TAF
      </Button>
      
      <TAFModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
};

export default TAFForm;
