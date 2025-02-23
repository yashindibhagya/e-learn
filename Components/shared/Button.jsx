import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';

export default function Button({ text, type = 'fill', onPress, loading }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading} // Prevent clicks when loading
      style={{
        padding: 15,
        width: '100%',
        borderRadius: 15,
        marginTop: 15,
        backgroundColor: type === 'fill' ? '#3c0061' : '#fff',
        borderWidth: type === 'outline' ? 2 : 0,
        borderColor: '#3c0061',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.7 : 1, // Reduce opacity when loading
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={type === 'fill' ? '#fff' : '#3c0061'} />
      ) : (
        <Text
          style={{
            color: type === 'fill' ? '#fff' : '#3c0061',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 18,
          }}
        >
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}
