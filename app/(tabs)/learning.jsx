import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideo } from '../../context/VideoContext';

export default function Learning() {
    const router = useRouter();
    const { coursesData, isLoading, getCourseProgress } = useVideo();
    const [activeTab, setActiveTab] = useState('public');
    const [searchQuery, setSearchQuery] = useState('');

    // Debug logging to see available courses when component mounts
    useEffect(() => {
        if (coursesData && coursesData.length > 0) {
            console.log('Available courses:',
                coursesData.map(c => ({
                    id: c.id,
                    title: c.title,
                    signsCount: c.signs?.length || 0
                }))
            );
        }
    }, [coursesData]);

    // Function to render each course card
    const renderCourseCard = ({ item }) => {
        const progress = getCourseProgress(item.id);



        return (
            <TouchableOpacity
                style={[styles.courseCard, { backgroundColor: '#fff' }]}
                onPress={() => handleCoursePress(item)}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.courseIcon}>{item.icon || '📚'}</Text>
                </View>
                <View style={styles.courseInfoContainer}>
                    <Text style={styles.courseTitle}>{item.title}</Text>
                    {progress.total > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
                        </View>
                    )}
                    <Text style={styles.chapterCount}>
                        {progress.total > 0 ? `${progress.completed}/${progress.total} chapters` : 'Coming soon'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Update the handleCoursePress function in your learning.jsx file
    const handleCoursePress = (course) => {
        // Log what we're doing
        console.log(`Navigating to ${course.title} course with ID: ${course.id}`);

        try {
            // Use the new course details page instead of the old direct course view
            router.push({
                pathname: '/courseView/courseDetails',
                params: { id: course.id }
            });
        } catch (error) {
            console.error("Navigation error:", error);
            // Fallback approach
            router.push(`/courseView/${course.id}`);
        }
    };

    // Filtered courses based on search
    const filteredCourses = coursesData?.filter(
        course => course.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4C9EFF" />
                    <Text>Loading courses...</Text>
                </View>
            </SafeAreaView>
        );
    }



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#D0F3DA" barStyle="dark-content" />

            <Text style={styles.pageTitle}>Explore</Text>

            <View style={styles.searchContainer}>
                <Text style={styles.searchLabel}>Search</Text>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for signs or collections"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'public' && styles.activeTab]}
                    onPress={() => setActiveTab('public')}
                >
                    <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>
                        Public
                    </Text>
                    {activeTab === 'public' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
                    onPress={() => setActiveTab('collections')}
                >
                    <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>
                        My collections
                    </Text>
                    {activeTab === 'collections' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
            </View>

            {filteredCourses.length > 0 ? (
                <FlatList
                    data={filteredCourses}
                    renderItem={renderCourseCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.courseList}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.noCoursesContainer}>
                    <Text style={styles.noCoursesText}>
                        {searchQuery ? `No courses matching "${searchQuery}"` : "No courses available"}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D0F3DA',
        padding: 25,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333333',
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchLabel: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 8,
    },
    searchInputContainer: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F5F5F5',
    },
    searchInput: {
        fontSize: 16,
        color: '#333333',
        padding: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        position: 'relative',
    },
    activeTab: {
        position: 'relative',
    },
    tabText: {
        fontSize: 16,
        color: '#999999',
    },
    activeTabText: {
        color: '#333333',
        fontWeight: 'bold',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#FFA500',
        borderRadius: 3,
    },
    courseList: {
        paddingBottom: 24,
    },
    courseCard: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        padding: 16,
        height: 170,
    },
    iconContainer: {
        alignItems: 'flex-end',
    },
    courseIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    courseInfoContainer: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    progressContainer: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 2,
    },
    chapterCount: {
        fontSize: 12,
        color: '#666666',
    },
    noCoursesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noCoursesText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});