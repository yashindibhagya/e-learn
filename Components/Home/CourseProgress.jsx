import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { imageAssets } from '../../constants/Option'
import { Image } from 'react-native'
import * as Progress from 'react-native-progress';
import CourseProgressCard from '../shared/CourseProgressCard';

export default function CourseProgress({courseList}) {

    const GetCompletedChapters =(course)=>{
        const completedChapter = course?.completedChapter?.length
        const perc= completedChapter/course?.chapters?.length
        return perc
    }

  return (
    <View style={styles.container} >
      <Text style={styles.text} >Progress</Text>


      <FlatList
      showsHorizontalScrollIndicator={false}
        data={courseList}
        horizontal={true}
        renderItem={({item,index}) =>(
            <View key={index}>
                <CourseProgressCard item={item}/>
            </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginTop: 10
    },
    text:{
        fontWeight: '900',
        fontSize: 25,
        color: '#fff'
    },
    imageView:{
        display:'flex',
        flexDirection: 'row',
        gap: 8
    },
    courseName:{
        fontWeight: 'bold',
        fontSize: 17,
        flexWrap: 'wrap'
    },
    chapter:{
        fontSize:15
    },
    progressBar:{
        marginTop: 10
    }
})