import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../assets/logo/onco_health_mart_logo.png';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import SideHeader from '../SideHeader/SideHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { LocationContext } from '../../utils/Location';

export default function Header({ isSearchShow = true, title = '', isLocation = true }) {
  const { CartCount } = useSelector((state) => state.cart) || {};
  const { location, getLocation, loader, errorMsg } = useContext(LocationContext);

  const [isSideHeaderOpen, setIsSideHeaderOpen] = useState(false);
  const [locationText, setLocationText] = useState('Select a location');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const navigation = useNavigation();

  const toggleSideHeader = useCallback(() => {
    setIsSideHeaderOpen((prev) => !prev);
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return 'Select a location';
    return address.length > 35 ? address.substring(0, 35) + '...' : address;
  }, []);

  // Open app settings
  const openAppSettings = useCallback(() => {
    Alert.alert(
      'Location Permission Required',
      'Please enable location permission in your device settings to use this feature.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
              } else {
                // For Android
           
              }
            } catch (error) {
              // Fallback to general settings if specific app settings fail
              await Linking.openSettings();
            }
          },
        },
      ]
    );
  }, []);

  // Handle location section press
  const handleLocationPress = useCallback(() => {
    if (isPermissionDenied) {
      openAppSettings();
    } else {
      navigation.navigate('LocationSelect');
    }
  }, [isPermissionDenied, openAppSettings, navigation]);

  // Fetch location only once (or when isLocation changes)
  useEffect(() => {
    if (!isLocation || hasAttemptedFetch) return;

    const fetchLocationOnce = async () => {
      setHasAttemptedFetch(true);

      if (!location) {
        await getLocation();
      }
    };

    fetchLocationOnce();
  }, [isLocation, location, getLocation, hasAttemptedFetch]);

  // Update displayed location text whenever location or error changes
  useEffect(() => {
    if (location?.weather) {
      const { postalCode = '', area = '', city = '' } = location.weather;
      const address = `${postalCode ? postalCode + ', ' : ''}${area} ${city}`.trim();
      setLocationText(formatAddress(address || 'Location found'));
      setIsPermissionDenied(false);
    } else if (errorMsg) {
      // Show user-friendly message based on common errors
      let message = 'Location unavailable';
      let isDenied = false;

      if (errorMsg.toLowerCase().includes('denied') || errorMsg.toLowerCase().includes('permission')) {
        message = 'Location permission denied';
        isDenied = true;
      } else if (errorMsg.toLowerCase().includes('unavailable')) {
        message = 'Location service unavailable';
      }

      setLocationText(message);
      setIsPermissionDenied(isDenied);
    } else if (hasAttemptedFetch && !loader) {
      setLocationText('Select a location');
      setIsPermissionDenied(false);
    }
  }, [location, errorMsg, loader, hasAttemptedFetch, formatAddress]);

  return (
    <>
      <LinearGradient colors={['#0A95DA', '#087BB8']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel="Open menu"
            activeOpacity={0.7}
            onPress={toggleSideHeader}
            style={styles.iconButton}
          >
            <Ionicons name="menu-outline" size={moderateScale(24)} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            accessible={true}
            accessibilityLabel="Go to home"
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home')}
            style={styles.logoContainer}
          >
            <Image source={logo} style={styles.logo} />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={`Cart with ${CartCount || 0} items`}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Cart')}
              style={styles.cartButton}
            >
              <Ionicons name="cart-outline" size={moderateScale(24)} color="#FFFFFF" />
              {CartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartCount}>{CartCount > 9 ? '9+' : CartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.searchLocationWrapper,
            {
              paddingHorizontal: isLocation ? moderateScale(12) : 0,
              paddingVertical: isLocation ? moderateScale(12) : 0,
            },
          ]}
        >
          {isLocation && (
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={
                isPermissionDenied
                  ? 'Enable location permission'
                  : 'Change location'
              }
              activeOpacity={0.7}
              style={styles.locationSection}
              onPress={handleLocationPress}
            >
              <View style={styles.locationContent}>
                {loader ? (
                  <ActivityIndicator size="small" color="#0A95DA" />
                ) : (
                  <>
                    <Ionicons
                      name={
                        errorMsg || !location
                          ? 'location-outline'
                          : 'location'
                      }
                      size={moderateScale(18)}
                      color={errorMsg ? '#EF4444' : '#0A95DA'}
                    />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.deliverToText}>Deliver to:</Text>
                      <Text
                        style={[
                          styles.locationText,
                          errorMsg && { color: '#EF4444' },
                        ]}
                        numberOfLines={2}
                      >
                        {locationText}
                      </Text>
                      {isPermissionDenied && (
                        <Text style={styles.tapToEnableText}>
                          Tap to enable in settings
                        </Text>
                      )}
                    </View>
                    {errorMsg && (
                      <Ionicons
                        name={
                          isPermissionDenied
                            ? 'settings-outline'
                            : 'information-circle-outline'
                        }
                        size={moderateScale(18)}
                        color="#EF4444"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}

          {isSearchShow && (
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Search products"
              activeOpacity={0.7}
              style={styles.searchBar}
              onPress={() => navigation.navigate('Search_Page')}
            >
              <Ionicons name="search-outline" size={moderateScale(18)} color="#0A95DA" />
              <Text style={styles.searchText}>Search medicines & health products</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <SideHeader isClosed={!isSideHeaderOpen} Open={toggleSideHeader} />
    </>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#0A95DA',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        backgroundColor: 'transparent',
    },
    iconButton: {
        padding: moderateScale(6),
        borderRadius: moderateScale(8),
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
    },
    logo: {
        height: moderateScale(35),
        width: moderateScale(110),
        resizeMode: 'contain',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartButton: {
        padding: moderateScale(6),
        marginLeft: moderateScale(8),
        borderRadius: moderateScale(8),
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -moderateScale(2),
        right: -moderateScale(2),
        backgroundColor: '#FF6B6B',
        minWidth: moderateScale(18),
        height: moderateScale(18),
        borderRadius: moderateScale(9),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(4),
    },
    cartCount: {
        color: '#fff',
        fontSize: moderateScale(10),
        fontWeight: '600',
    },
    searchLocationWrapper: {
        backgroundColor: '#F8F9FA',
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: moderateScale(8),
    },
    locationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationTextContainer: {
        marginLeft: moderateScale(8),
        flex: 1,
    },
    deliverToText: {
        fontSize: moderateScale(11),
        color: '#6B7280',
        fontWeight: '400',
    },
    locationText: {
        fontSize: moderateScale(14),
        color: '#1F2937',
        fontWeight: '500',
    },
    tapToEnableText: {
        fontSize: moderateScale(10),
        color: '#EF4444',
        fontWeight: '400',
        marginTop: moderateScale(2),
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchText: {
        marginLeft: moderateScale(8),
        fontSize: moderateScale(14),
        color: '#9CA3AF',
        flex: 1,
    },
});