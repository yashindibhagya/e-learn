import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Praticeoption } from '../../../constants/Option';
import { db } from '../../../config/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { UserDetailContext } from '../../../context/UserDetailContext';
import CourseListGrid from '../../../Components/PracticeScreen/CourseListGrid';

export default function PracticeTypeHomeScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { userDetail } = useContext(UserDetailContext);

    const type = params?.type || '';
    const option = Praticeoption.find(item => item.name.trim().toLowerCase() === type.trim().toLowerCase());

    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userDetail) {
            GetCourseList();
        }
    }, [userDetail]);

    const GetCourseList = async () => {
        setLoading(true);
        setCourseList([]);

        try {
            const q = query(
                collection(db, 'Courses'),
                where('createdBy', '==', userDetail?.email),
                orderBy('createdOn', 'desc')
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("No courses found for this user.");
            }

            const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            //console.log("Fetched Courses:", courses);

            setCourseList(courses);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }

        setLoading(false);
    };

    if (!option) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Invalid practice type</Text>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="white" />
                    <Text style={styles.backText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={option.image} style={styles.image} />   

            <Pressable onPress={() => router.back()} style={styles.iconContainer}>
                <Ionicons name="arrow-back-outline" size={24} color="black" style={styles.icon} />
            </Pressable>

            <View style={styles.textView}>
                <Text style={styles.text}>{type}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3c0061" style={styles.indicator} />
            ) : (
                <CourseListGrid courseList={courseList} option={option} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    image: {
        height: 200,
        width: '100%'
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10
    },
    textView: {
        marginTop: 20,
        paddingHorizontal: 15,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center'
    },
    text: {
        fontWeight: 'bold',
        fontSize: 30,
        position: 'absolute'
    },
    indicator: {
        marginTop: 150
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 10
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5
    },
    backText: {
        color: 'white',
        marginLeft: 5
    }
});
