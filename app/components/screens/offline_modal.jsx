import React, { useContext } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Connection } from '../../contexts/network and appstate';

export default function OfflineModal() {
  const {connected} = useContext(Connection);

  return (
    <Modal
      visible={!connected}       // Show only when offline
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.text}>🔴 You are offline!</Text>
          <Text style={styles.subText}>Please check your internet connection.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  subText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
