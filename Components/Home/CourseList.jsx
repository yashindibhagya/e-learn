import { View, Text ,StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import { FlatList } from 'react-native'
import {imageAssets} from '../../constants/Option'
import { Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';


export default function CourseList({courseList, heading = "Courses"}) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{heading}</Text>

      <FlatList
        data={courseList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item,index}) => (
            <TouchableOpacity 
            onPress={()=>router.push({
              pathname: '/courseView/'+item?.docId,
              params:{
                courseParams: JSON.stringify(item)
              }
            })}
            key={index} style={styles.courseContainer} >
                <Image source={imageAssets[item.bannerImage]}
                style={{
                  width: '100%',
                  height: 150,
                  borderRadius: 15
                }}
                />
                <Text style={styles.courseName} >{item?.courseName}</Text>

                <View style={styles.chapter} >
                  <Ionicons name="book-outline" size={20} color="black" />
                  <Text 
                  style={styles.chapterText}>
                    {item?.chapters?.length} Chapters
                    </Text>
                </View>
            </TouchableOpacity>

        )}
      />
    </View>
  )
}


const styles = StyleSheet.create({
    container:{
        marginTop: 15
    },

    text:{
        fontWeight: '900',
        fontSize: 25
    },
    courseContainer:{
      padding: 10,
      backgroundColor: '#F5F5F5',
      margin: 6,
      width: 260,
      borderRadius: 15
    },
    courseName:{
      fontWeight: 'bold',
      fontSize: 18,
      marginTop: 10
    },
    chapter:{
      display: 'flex',
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
      marginTop: 5
    },

    chapterText:{
      fontSize: 12
    }
})