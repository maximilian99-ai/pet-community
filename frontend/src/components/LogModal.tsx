'use client';

import { Box, Button, Card, CardBody, VStack, HStack, Text, useColorMode, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Input, Textarea, Select, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Badge } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useState, useRef } from 'react';
import { useGetLogs, useCreateLog, useUpdateLog, useDeleteLog } from '@/hooks/useLog';
import { Log } from '@/types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
}

export default function LogModal({ isOpen, onClose, petId }: LogModalProps) {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { data: logs = [], isLoading } = useGetLogs(petId);
  const createLogMutation = useCreateLog();
  const updateLogMutation = useUpdateLog();
  const deleteLogMutation = useDeleteLog();

  const [logData, setLogData] = useState({ type: 'feeding', content: '', date: new Date().toISOString().split('T')[0] });
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const addLogDisclosure = useDisclosure();
  const deleteConfirmDisclosure = useDisclosure();

  const logTypes = ['feeding', 'walk', 'health', 'play', 'other'];

  const getLogTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      feeding: t('log.types.feeding'),
      walk: t('log.types.walk'),
      health: t('log.types.health'),
      play: t('log.types.play'),
      other: t('log.types.other'),
    };
    return labels[type] || type;
  };

  const handleAddLog = () => {
    setLogData({ type: 'feeding', content: '', date: new Date().toISOString().split('T')[0] });
    setEditingLogId(null);
    addLogDisclosure.onOpen();
  };

  const handleSaveLog = async () => {
    try {
      if (!logData.content) {
        toast({
          title: t('common.error'),
          description: t('log.validationContentRequired'),
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      if (editingLogId) {
        await updateLogMutation.mutateAsync({
          logId: editingLogId,
          type: logData.type as 'feeding' | 'walk' | 'health' | 'play' | 'other',
          content: logData.content,
          date: logData.date
        });
        addLogDisclosure.onClose();
        toast({
          title: t('common.success'),
          description: t('log.updated'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } else {
        await createLogMutation.mutateAsync({
          petId,
          type: logData.type as 'feeding' | 'walk' | 'health' | 'play' | 'other',
          content: logData.content,
          date: logData.date
        });
        addLogDisclosure.onClose();
        toast({
          title: t('common.success'),
          description: t('log.created'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Failed to save log:', error);
      toast({
        title: t('common.error'),
        description: t('log.saveFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleEditLog = (log: Log) => {
    setEditingLogId(log.id);
    setLogData({
      type: log.type,
      content: log.content,
      date: new Date(log.date).toISOString().split('T')[0],
    });
    addLogDisclosure.onOpen();
  };

  const handleDeleteLog = (logId: string) => {
    setDeletingLogId(logId);
    deleteConfirmDisclosure.onOpen();
  };

  const confirmDeleteLog = async () => {
    try {
      if (deletingLogId) {
        await deleteLogMutation.mutateAsync(deletingLogId);
        deleteConfirmDisclosure.onClose();
        toast({
          title: t('common.success'),
          description: t('log.deleted'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Failed to delete log:', error);
      toast({
        title: t('common.error'),
        description: t('log.deleteFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const getLogTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      feeding: 'green',
      walk: 'blue',
      health: 'red',
      play: 'purple',
      other: 'gray',
    };
    return colors[type] || 'gray';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
          <ModalHeader>{t('dashboard.logs')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Button colorScheme="blue" onClick={handleAddLog} width="100%">
                {t('log.add')}
              </Button>

              {isLoading ? (
                <Text>{t('common.loading')}</Text>
              ) : logs.length === 0 ? (
                <Text>{t('log.noLogs')}</Text>
              ) : (
                <VStack spacing={3} width="100%">
                  {[...logs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log: Log) => (
                      <Card key={log.id} width="100%">
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" width="100%">
                              <Badge colorScheme={getLogTypeColor(log.type)}>
                                {getLogTypeLabel(log.type)}
                              </Badge>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(log.date).toLocaleDateString()}
                              </Text>
                            </HStack>
                            <Text>{log.content}</Text>
                            <HStack spacing={2}>
                              <Button size="sm" colorScheme="blue" onClick={() => handleEditLog(log)}>
                                {t('common.edit')}
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteLog(log.id)}
                              >
                                {t('common.delete')}
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add/Edit Log Modal */}
      <Modal isOpen={addLogDisclosure.isOpen} onClose={addLogDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
          <ModalHeader>
            {editingLogId ? t('log.edit') : t('log.add')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Text mb={2} fontWeight="bold">
                  {t('log.fields.type')}
                </Text>
                <Select
                  value={logData.type}
                  onChange={(e) => setLogData({ ...logData, type: e.target.value })}
                >
                  {logTypes.map((type) => (
                    <option key={type} value={type}>
                      {getLogTypeLabel(type)}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box width="100%">
                <Text mb={2} fontWeight="bold">
                  {t('log.fields.date')}
                </Text>
                <Input
                  type="date"
                  value={logData.date}
                  onChange={(e) => setLogData({ ...logData, date: e.target.value })}
                />
              </Box>
              <Box width="100%">
                <Text mb={2} fontWeight="bold">
                  {t('log.fields.content')}
                </Text>
                <Textarea
                  value={logData.content}
                  onChange={(e) => setLogData({ ...logData, content: e.target.value })}
                  placeholder={t('log.placeholder')}
                  rows={4}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={addLogDisclosure.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveLog} isLoading={createLogMutation.isPending || updateLogMutation.isPending}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteConfirmDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteConfirmDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('log.deleteTitle')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('log.deleteConfirm')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteConfirmDisclosure.onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteLog} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
