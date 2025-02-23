import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import { imageAssets } from '../../constants/Option'
import * as Progress from 'react-native-progress';

export default function CourseProgressCard({item, width=280}) {

    const GetCompletedChapters =(course)=>{
        const completedChapter = course?.completedChapter?.length
        const perc= completedChapter/course?.chapters?.length
        return perc
    }

  return (
    <View style={{
                margin: 7,
                padding: 15,
                backgroundColor: '#F5F5F5',
                borderRadius: 15,
                width: width,
                elevation: 2
            }}>
                <View style={styles.imageView} >
                    <Image source={imageAssets[item?.bannerImage]} 
                        style={{
                            height: 100,
                            width: 100,
                            borderRadius: 8
                        }}
                    />
                    <View style={{
                        flex: 1
                    }}>
                        <Text
                            numberOfLines={2}
                            style={styles.courseName} >{item?.courseName}</Text>
                        <Text style={styles.chapter} >{item?.chapters?.length} Chapters</Text>
                    </View>
                </View>

                <View style={styles.progressBar} >
                    <Progress.Bar progress={GetCompletedChapters(item)} width={width-30} color="#3c0061" />
                    <Text style={{
                        marginTop: 2
                    }}>{item?.completedChapter?.length ?? 0} Out of {item?.chapters?.length} Chapters Completed</Text>
                </View>

            </View>
  )
}

const styles = StyleSheet.create({
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
    },
    imageView:{
        display:'flex',
        flexDirection: 'row',
        gap: 8
    },
})