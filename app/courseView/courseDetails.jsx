import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function CourseDetailsView() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const [courseDetails, setCourseDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [videoRef, setVideoRef] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

    // Load course details
    useEffect(() => {
        if (!id) return;
        const fetchCourseDetails = async () => {
            setIsLoading(true);
            try {
                const courseDoc = await getDoc(doc(db, 'Courses', id));
                if (courseDoc.exists()) {
                    const courseData = courseDoc.data();
                    setCourseDetails(courseData);

                    // Calculate progress
                    const totalChapters = courseData.chapters?.length || 0;
                    const completedChapters = courseData.completedChapter?.length || 0;
                    const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

                    setProgress({
                        completed: completedChapters,
                        total: totalChapters,
                        percentage: percentage
                    });

                    // Set first chapter as selected lesson
                    if (courseData.chapters && courseData.chapters.length > 0) {
                        setSelectedLesson(courseData.chapters[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

    // Handle lesson selection
    const handleLessonSelect = (lesson, index) => {
        setSelectedLesson(lesson);
        if (videoRef) {
            videoRef.pauseAsync();
            setIsPlaying(false);
        }
    };

    // Update the handleContinueLearning function in the courseDetails.jsx file
    const handleContinueLearning = () => {
        if (!courseDetails) return;

        // Check if this is an alphabet or sign language course
        if (courseDetails.id === 'alphabet' || courseDetails.id === 'sinhala-alphabet') {
            // Navigate to signView for sign language courses
            const firstSign = courseDetails.signs && courseDetails.signs.length > 0
                ? courseDetails.signs[0]
                : null;

            router.push({
                pathname: '/signView',
                params: {
                    sign: firstSign ? JSON.stringify(firstSign) : null,
                    category: courseDetails.title || 'Alphabet',
                    index: 0
                }
            });
        } else {
            // For other course types, use the regular chapter view
            // Find the first incomplete chapter
            const completedChapters = courseDetails.completedChapter || [];
            let nextChapterIndex = 0;

            for (let i = 0; i < courseDetails.chapters?.length; i++) {
                if (!completedChapters.includes(i.toString())) {
                    nextChapterIndex = i;
                    break;
                }
            }

            // Navigate to chapter view
            router.push({
                pathname: '/chapterView',
                params: {
                    chapterParams: JSON.stringify(courseDetails.chapters[nextChapterIndex]),
                    docId: id,
                    chapterIndex: nextChapterIndex
                }
            });
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4C9EFF" />
                    <Text style={styles.loadingText}>Loading course...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Details</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Feather name="bookmark" size={22} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Feather name="more-vertical" size={22} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Course Banner */}
                <View style={[
                    styles.courseBanner,
                    { backgroundColor: '#4C9EFF' }
                ]}>
                    <View style={styles.courseIconContainer}>
                        <Text style={styles.courseIcon}>📚</Text>
                    </View>
                    <Text style={styles.courseTitle}>{courseDetails?.courseName || 'Course Title'}</Text>
                </View>

                {/* About Course */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About Course:</Text>
                    <Text style={styles.courseDescription}>
                        {courseDetails?.description || 'Course description not available.'}
                    </Text>
                </View>

                {/* Instructor */}
                <View style={styles.instructorContainer}>
                    <Image
                        source={require('../../assets/images/gesture.png')}
                        style={styles.instructorImage}
                    />
                    <View style={styles.instructorInfo}>
                        <Text style={styles.instructorName}>Tim Marshall</Text>
                        <Text style={styles.instructorRole}>Course Instructor</Text>
                    </View>
                    <View style={styles.instructorStats}>
                        <Text style={styles.instructorCourses}>5 Courses</Text>
                        <MaterialIcons name="chevron-right" size={20} color="#999" />
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTabs}>
                        <TouchableOpacity style={[styles.progressTab, styles.activeTab]}>
                            <Text style={styles.progressTabText}>Courses</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.progressTab}>
                            <Text style={styles.progressTabText}>Projects</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.progressInfoContainer}>
                        <Text style={styles.progressPercentage}>Complete {progress.percentage}%</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
                        </View>
                    </View>
                </View>

                {/* Lessons List */}
                <View style={styles.lessonsContainer}>
                    <View style={styles.lessonsHeader}>
                        <MaterialIcons name="play-lesson" size={20} color="#4C9EFF" />
                        <Text style={styles.lessonsTitle}>{courseDetails?.chapters?.length || 0} Lessons</Text>
                    </View>

                    {courseDetails?.chapters && courseDetails.chapters.length > 0 ? (
                        courseDetails.chapters.map((chapter, index) => {
                            const isCompleted = (courseDetails.completedChapter || []).includes(index.toString());
                            const isSelected = selectedLesson && selectedLesson.chapterTitle === chapter.chapterTitle;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.lessonItem,
                                        isSelected && styles.selectedLessonItem,
                                        isCompleted && styles.completedLessonItem
                                    ]}
                                    onPress={() => handleLessonSelect(chapter, index)}
                                >
                                    <View style={[
                                        styles.lessonIconContainer,
                                        isCompleted && styles.completedLessonIconContainer,
                                        isSelected && styles.selectedLessonIconContainer
                                    ]}>
                                        {isCompleted ? (
                                            <MaterialIcons name="check" size={16} color="#fff" />
                                        ) : (
                                            <Text style={styles.lessonNumber}>{index + 1}</Text>
                                        )}
                                    </View>

                                    <View style={styles.lessonInfo}>
                                        <Text style={[
                                            styles.lessonTitle,
                                            isSelected && styles.selectedLessonTitle
                                        ]}>
                                            {index + 1}. {chapter.chapterTitle}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <Text style={styles.noLessonsText}>No lessons available yet</Text>
                    )}
                </View>
            </ScrollView>

            {/* Continue Learning Button */}
            <View style={styles.continueButtonContainer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinueLearning}
                >
                    <Text style={styles.continueButtonText}>Continue Learning</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        flex: 1,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    headerIcon: {
        padding: 4,
        marginLeft: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 90,
    },
    courseBanner: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        margin: 16,
    },
    courseIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    courseIcon: {
        fontSize: 36,
    },
    courseTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    sectionContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    courseDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    instructorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    instructorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    instructorInfo: {
        flex: 1,
    },
    instructorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    instructorRole: {
        fontSize: 12,
        color: '#777',
    },
    instructorStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instructorCourses: {
        color: '#4C9EFF',
        marginRight: 4,
    },
    progressContainer: {
        margin: 16,
    },
    progressTabs: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    progressTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4C9EFF',
    },
    progressTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    progressInfoContainer: {
        marginBottom: 16,
    },
    progressPercentage: {
        fontSize: 14,
        marginBottom: 8,
        color: '#333',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4C9EFF',
        borderRadius: 3,
    },
    lessonsContainer: {
        marginHorizontal: 16,
    },
    lessonsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    lessonsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedLessonItem: {
        backgroundColor: '#f0f9ff',
    },
    completedLessonItem: {
        backgroundColor: '#f0fff0',
    },
    lessonIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    completedLessonIconContainer: {
        backgroundColor: '#4CAF50',
    },
    selectedLessonIconContainer: {
        backgroundColor: '#4C9EFF',
    },
    lessonNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    selectedLessonTitle: {
        fontWeight: 'bold',
        color: '#4C9EFF',
    },
    noLessonsText: {
        textAlign: 'center',
        color: '#999',
        padding: 16,
    },
    continueButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    continueButton: {
        backgroundColor: '#4C9EFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});