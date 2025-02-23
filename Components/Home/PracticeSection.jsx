import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import React from 'react'
import { Praticeoption } from '../../constants/Option'
import { useRouter } from 'expo-router';


export default function PracticeSection() {
    const router= useRouter();
  return (
    <View style={styles.container} >
      <Text style={styles.text} >Practice</Text>

      <View>
        <FlatList
            data={Praticeoption}
            numColumns={3}
            renderItem={({item,index})=>(
                <TouchableOpacity onPress={()=>router.push(`/practice/${item.name}`)} 
                key={index} style={styles.practiceImage} >
                    <Image source={item?.image} 
                    style={styles.image} />

                    <Text style={styles.itemText} >{item.name}</Text>
                </TouchableOpacity>
            )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginTop: 10
    },

    text:{
        fontWeight: '900',
        fontSize: 25
    },
    image:{
        width: '100%',
        height: '100%',
        maxHeight: 160,
        borderRadius: 15,
    },
    practiceImage:{
        flex: 1,
        margin:5,
        aspectRatio: 1
    },
    itemText:{
        position: 'absolute',
        padding: 15,
        fontSize: 15,
        //color: '#fff'
        //color: '#3c0061'
    }

})