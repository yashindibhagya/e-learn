import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

export default function CourseListGrid({ courseList, option }) {
    const router = useRouter();

    if (!courseList || courseList.length === 0) {
        return <Text style={styles.noCourses}>No courses available.</Text>;
    }

    const onPress =(course)=>{

        
        router.push({
                pathname: option.path,
                params:{
                    courseParams: JSON.stringify(course)
                }
            })
    }

    return (
        <View>
            <FlatList
                data={courseList}
                numColumns={2}
                keyExtractor={(item) => item.id} // Unique keys for items
                style={styles.flatlist}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={()=>onPress(item)} 
                    style={styles.viewKey}>
                        <AntDesign name="checkcircle" size={24} color="gray" style={styles.check} />

                        {/* Fixing the image source issue */}
                        <Image source={typeof option?.icon === "string" ? { uri: option.icon } : option.icon} style={styles.icon} />

                        {/* Fixing the text display issue */}
                        <Text style={styles.text}>{item.chapterTitle || item.courseName}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flatlist: {
        padding: 20
    },
    icon: {
        width: '100%',
        height: 70,
        resizeMode: 'contain', // Ensures proper image scaling
        top: 20
    },
    viewKey: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#fff',
        margin: 7,
        borderRadius: 15,
        elevation: 1
    },
    text: {
        textAlign: 'center',
        marginTop: 30
    },
    check: {
        position: 'absolute',
        top: 10,
        right: 20
    },
    noCourses: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray'
    }
});
