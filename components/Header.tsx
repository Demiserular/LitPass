import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Search } from 'lucide-react-native';

type HeaderProps = {
  onSearchPress: () => void;
  onProfilePress: () => void;
  profileImage?: string;
};

export function Header({
  onSearchPress,
  onProfilePress,
  profileImage,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onProfilePress} style={styles.profileContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('@/assets/images/placeholder-avatar.png')
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Text style={styles.title}>Events</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}>
          <Search size={24} color="#fff" />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});