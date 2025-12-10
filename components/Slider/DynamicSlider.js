import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function DynmaicSlider({
  autoPlay = false,
  delay = 3000,
  isUri = false,
  imagesByProp = [],
  navigationShow = false, // ab default false
  heightPass = 200,
  mainWidth = '100%',
  mode = 'cover',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [images, setImages] = useState([]);
  const scrollRef = useRef(null);

  const slideWidth =
    typeof mainWidth === 'number' ? mainWidth : screenWidth; // paging ke liye numeric width

  // images set from props
  useEffect(() => {
    if (imagesByProp.length > 0) {
      setImages(imagesByProp[0]?.src || []);
    } else {
      setImages([]);
    }
  }, [imagesByProp]);

  // autoplay handle with scrollTo
  useEffect(() => {
    if (!autoPlay || images.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * slideWidth,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [autoPlay, delay, images.length, slideWidth]);

  const handleScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / slideWidth);
    setActiveIndex(currentIndex);
  };

  const goToNext = () => {
    if (images.length === 0) return;
    const nextIndex = (activeIndex + 1) % images.length;
    scrollRef.current?.scrollTo({
      x: nextIndex * slideWidth,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const goToPrevious = () => {
    if (images.length === 0) return;
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    scrollRef.current?.scrollTo({
      x: prevIndex * slideWidth,
      animated: true,
    });
    setActiveIndex(prevIndex);
  };

  if (images.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ height: heightPass, width: mainWidth }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {images.map((img, index) => (
            <View
              key={index}
              style={{ width: slideWidth, height: heightPass }}
            >
              {isUri ? (
                <Image
                  source={{ uri: String(img) }}
                  style={[styles.image, { resizeMode: mode }]}
                />
              ) : (
                <Image source={img} style={styles.image} />
              )}
            </View>
          ))}
        </ScrollView>

        {/* optional nav buttons (still work, but hidden by default) */}
        {navigationShow && (
          <View style={styles.navigation}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={goToPrevious}
              style={styles.navButton}
            >
              {/* apna icon daal sakte ho */}
              <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={goToNext}
              style={styles.navButton}
            >
              <Text style={{ color: '#fff', fontSize: 20 }}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navigation: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    margin: 12,
    padding: 6,
    alignItems: 'center',
  },
});
