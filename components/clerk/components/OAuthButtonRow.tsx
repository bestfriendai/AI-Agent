import { useClerk } from '@clerk/clerk-expo'
import { EnvironmentResource, OAuthStrategy } from '@clerk/types'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import FormDivider from './FormDivider'
import OAuthButton from './OAuthButton'

interface Props {
  scheme?: string
  showDivider?: boolean
}

function OAuthButtonRow({ scheme, showDivider }: Props) {
  const clerk = useClerk()

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource
  const oauthStrategies = environment?.userSettings?.socialProviderStrategies

  if (!oauthStrategies) {
    return null
  }

  return (
    <>
      <View style={styles.socialButtonsContainer}>
        {scheme && oauthStrategies.map((strategy: OAuthStrategy) => (
          <View key={strategy} style={styles.socialButtonWrapper}>
            <OAuthButton strategy={strategy} hideText={oauthStrategies.length > 3} scheme={scheme} />
          </View>
        ))}
      </View>
      {showDivider && <FormDivider />}
    </>
  )
}

export default OAuthButtonRow

const styles = StyleSheet.create({
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
});