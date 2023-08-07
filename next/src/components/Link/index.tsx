import { memo } from 'react'
import NextLink from 'next/link'
import styled from 'styled-components'

const ColouredLink = styled.a`
  color: #6cc0e5;

  &:hover {
    color: #e6df55;
  }

  &:active {
    color: #999540;
  }

  &:visited {
    color: #e68393;
  }

  &:visited:hover {
    color: #e6df55;
  }
`

function Link({
  children, href, title = '', ...props
}) {
  return (
    <NextLink href={href} {...props} passHref legacyBehavior>
      <ColouredLink title={title}>{children}</ColouredLink>
    </NextLink>
  )
}

export default memo(Link)
