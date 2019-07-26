#*
 * OmniNav v2 format.
 * Chapman.edu/_components/omni_nav_v2/omni_nav.vtl
 *
 * It would make sense to move the various component-specific macros (like those
 * for Primary Nav) into their own file and import them like so:
 *
 * #import( "/_components/omni_nav_v2/macros/primary_nav.vm" )
 *
 * But this makes debugging the code in Cascade's format editor much harder. It is
 * simpler to just keep it all in a well-structured single file.
 *
 * Note: the site://Chapman.edu/ seen in most href is not a hardcoded subdomain but a Cascade variable 
 * that allows path to render correctly even when a page published to other webservers not www
 *#

##
## Imports
##
#import( "/_config/global_nav.vm" )
#import( "/_config/global_nav_law.vm" )

##
## Hardcoded Params
##
## umbrellaCategories
## These are locations for which OmniNav should build the secondary off-canvas-nav menu.
## umbrellaCategory is the term product owners use.
## I would prefer that each inner array item within the array were only 2 items and
## all other vars be derived from those:
## [$umbrellaFolderId, $umbrellaLabel]
## Current inner array values:
## [ $umbrellaDirectory, $umbrellaLabel/$umbrellaBrandLabel ]
#set ( $umbrellaCategories = [
  [ 'business', 'Argyros School' ],
  [ 'education', 'Attallah College' ],
  [ 'dodge', 'Dodge College' ],
  [ 'crean', 'Crean College' ],
  [ 'wilkinson', 'Wilkinson College' ],
  [ 'copa', 'College of Performing Arts' ],
  [ 'engineering', 'Fowler School of Engineering' ],
  [ 'pharmacy', 'School of Pharmacy' ],
  [ 'law', 'Fowler School of Law' ],
  [ 'library-new', 'Leatherby Libraries' ],
  [ 'scst', 'Schmid College' ],
  [ 'communication', 'School of Communication' ],
  [ 'about', 'About' ],
  [ 'academics', 'Academics' ],
  [ 'admission', 'Admission' ],
  [ 'alumni', 'Alumni' ],
  [ 'campus-services', 'Campus Services' ],
  [ 'campus-services/career-professional-development', 'Career' ],
  [ 'faculty-staff', 'Faculty and Staff' ],
  [ 'families', 'Families' ],
  [ 'research', 'Research' ],
  [ 'students', 'Students' ],
  [ 'support-chapman', 'Support Chapman' ]
])

##
## Vars
##
## Cascade provides a $currentPage object to every format.
#set ( $pagePath = $currentPage.path )

## This will be set by data macros below.
#set ( $pageUmbrellaCategory = [] )
#set ( $isUmbrellaCategory = false )
#set ( $umbrellaDirectory = '' )
#set ( $umbrellaDirectoryPath = '' )
#set ( $umbrellaLabel = '' )
#set ( $umbrellaBrandLabel = '' )
#set ( $umbrellaAssets = [] )
#set ( $brandClass = '' )
#set ( $globalNavLinks = [] )

##
## Var Macros
##
#macro ( setVars )
  #setPageUmbrellaCategory()

  #set ( $isUmbrellaCategory = $pageUmbrellaCategory.size() > 0 )

  #if ( $isUmbrellaCategory )
    #set ( $umbrellaDirectory = $pageUmbrellaCategory[0] )

    ## These 2 were originally different values and could differ in the future.
    #set ( $umbrellaLabel = $pageUmbrellaCategory[1] )
    #set ( $umbrellaBrandLabel = $pageUmbrellaCategory[1] )

    #set ( $umbrellaDirectoryPath = "/${umbrellaDirectory}" )
    #setUmbrellaAssets()
    #set ( $brandClass = 'branded' )
  #else
    #set ( $brandClass = 'unbranded' )
  #end

  ## Currently law is the only page with different global nav content
  #if( $umbrellaDirectory == 'law' )
    #set( $globalNavLinks = $GLOBAL_NAV_LAW_CONFIG )
  #else
    #set( $globalNavLinks = $GLOBAL_NAV_CONFIG )
  #end
#end

#macro ( setPageUmbrellaCategory )
  ## Is current path under one of specified $umbrellaCategories?
  #foreach ( $umbrellaCategory in $umbrellaCategories )
    #set ( $dirName = $umbrellaCategory[0] )

    ## Define substr range to compare umbrella dir with current page path.
    ## pagePath does not include leading /.
    #set ( $startSubStr = 0 )
    #set ( $endSubStr = $dirName.length() )

    ## Make sure endSubStr not long than pagePath else will throw exception
    #if ( $endSubStr > $pagePath.length() )
      #set ( $endSubStr = $pagePath.length() )
    #end

    #set ( $pagePathDir = $pagePath.substring($startSubStr, $endSubStr) )

    ## Is current page directory $pagePathDir under this $navDirectory? If so,
    ## we found our $navDirectory.
    #if ( $pagePath.contains($dirName) && $pagePathDir == $dirName )
      ## A page can enter this loop more than once if it falls under multiple umbrella categories
      ## e.g. a page under both Campus Services and Career umbrellas
      ## First check if it hasn't been set yet
      #if ( $pageUmbrellaCategory.size() == 0 )
        #set ( $pageUmbrellaCategory = $umbrellaCategory )
      ## If it has been set, pages should use the umbrella category that's more specific
      ## This ensures the page uses the closest matching directory out of all the umbrella categories
      ## e.g. a page under Career should use campus-services/career umbrella not campus-services
      #elseif ( $pagePathDir.length() > $pageUmbrellaCategory[0].length() )
        #set ( $pageUmbrellaCategory = $umbrellaCategory )
      #end
    #end
  #end
#end

#macro ( setUmbrellaAssets )
  ## umbrellaAssets equal Umbrella directory's visible (non-index) children. These
  ## are used in OffCanvasNav secondary menu. This must be called after
  ## $umbrellaDirectoryPath is set.
  #set ( $umbrellaFolder = $_.locateFolder($umbrellaDirectoryPath) )

  #foreach( $childAsset in $umbrellaFolder.children )
    ## When the 'Hide from navigation' box is not checked, and it has never been checked, the metadata
    ## field doesn't exist for that asset. When the box is not checked, but it was at one point, it exists with a value of ''.
    ## See Github issue: https://github.com/chapmanu/cascade-assets/issues/262
    ## By default, set visibility to false
    #set ( $isVisibleChild = false )
    ## Since a symLink (External Link added to folders) can't be set by user to Hidden, set visibility to true:
    #if ( $childAsset.assetType == 'symlink' )
        #set ( $isVisibleChild = true ) 
    #end
    #if ( $childAsset.assetType == 'folder')
      ## Both the folder and index page must be visible
      #set ( $folderVisible = $childAsset.metadata.getDynamicField('Hide from navigation').value != "Yes" )
      #set ( $folderIndexPage = $_.locatePage("${childAsset.path}/index" ) )
      #set ( $folderIndexVisible = $folderIndexPage.metadata.getDynamicField('Hide from navigation').value != "Yes" )

      #if ( $folderIndexVisible && $folderVisible )
          #set ( $isVisibleChild = true )
      #end
    #elseif ( $childAsset.assetType == 'page' && ($childAsset.name != 'index') )
      #set ( $isVisibleChild = $childAsset.metadata.getDynamicField('Hide from navigation').value != "Yes" )
    #end

    #if ( $isVisibleChild )
      #set ( $discard = $umbrellaAssets.add($childAsset) )
    #end
  #end
#end

##
## Template Macros
##
#macro ( buildOmniNav )
<div id="omni-nav-v2" class="$brandClass">
  <!-- pagePath: $pagePath -->
  <!-- pageUmbrellaCategory: $pageUmbrellaCategory -->
  <!-- umbrellaAssets count: $umbrellaAssets.size() -->

  ## Uncomment to list pageUmbrella child assets.
  ##debugUmbrellaAssets()

  #buildUtilityNav()
  #buildPrimaryNav()
  #buildOffCanvasNav()

  <!-- Page overlay for when search results are displayed -->
  <div id="search-results-overlay"></div>
</div>
#end


##
## Primary Nav Macros
##
#macro ( buildPrimaryNav )
  <div id="primary-nav">
    #buildPrimaryNavLeftContainer()
    #buildPrimaryNavLogoContainer()
    <div class="right-container">
        #buildGlobalNav()
        #buildPrimaryNavRightContainer()
    </div>
    #buildPrimaryNavSearchBox()
  </div>
#end

#macro ( buildPrimaryNavLeftContainer )
    #if (! $pagePath.contains('navsNoJS'))
      <div class="nav-container left-nav-container">
        <a href="#"
           id="js-off-canvas-trigger"
           class="off-canvas-trigger primary-nav-icon"
           role="button"
           title="Access links to the pages within this section of the website and to other sections of the website"
           aria-label="Access links to the pages within this section of the website and to other sections of the website">
          <svg class="hamburger-icon" width="32" height="32" viewBox="0 0 16 16">
            <path d="M1 3h14v2h-14v-2z"></path>
            <path d="M1 7h14v2h-14v-2z"></path>
            <path d="M1 11h14v2h-14v-2z"></path>
          </svg>
        </a>
      </div>
    #end
#end

#macro ( buildPrimaryNavLogoContainer )
  <div class="nav-container logo-container">
    <div class="cu-logo-wrapper">
      <div class="primary-logo">
        <a href="site://Chapman.edu/index" title="Chapman University Website Home Page">
          <svg class="chapman-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 273.7 28.1">
            <defs>
              <style>.cls-1{fill:#a50034;}.cls-2{fill:#231f20;}</style>
            </defs>
            <title>Chapman University</title>
            <path id="window" class="cls-1" d="M13,14.5,0,27.5v-13ZM0,13.6V.6l13,13ZM27.5,0l-13,13V0ZM13.6,13,.6,0h13Zm1.5.6,13-13v13Zm13,.9v13l-13-13Zm-14.5.6-13,13h13Zm.9,0v13h13Z"/><g id="chapman-university"><path class="cls-2" d="M48,10.3c-.7-2.5-2.1-3.2-4.2-3.2-3.9,0-5.7,3-5.7,6.4,0,4.2,2.2,7,5.7,7,2.5,0,3.6-1.2,4.7-3.5l.5.1c-.3.9-.8,2.7-1.1,3.5a18.44,18.44,0,0,1-4.1.6c-5.5,0-7.9-3.8-7.9-7.2,0-4.5,3.5-7.7,8.3-7.7a13.86,13.86,0,0,1,4,.6c.2,1.2.3,2.2.4,3.3ZM61.7,13V9.9c0-2.4-.2-2.5-1.9-2.7V6.7h5.8v.5c-1.8.1-2,.3-2,2.7v7.9c0,2.4.2,2.5,2,2.7V21h-6v-.5c1.9-.1,2.1-.3,2.1-2.7V13.9H54.1v3.9c0,2.4.2,2.5,2,2.7V21H50.3v-.5c1.8-.1,2-.3,2-2.7V9.9c0-2.4-.2-2.5-2.1-2.7V6.7H56v.5c-1.7.1-1.9.3-1.9,2.7V13Zm13.6,7.5.7-.1c.8-.1.9-.3.7-1-.2-.5-.8-2.2-1.4-3.8H70.9c-.2.6-.8,2.3-1.1,3.2-.4,1.3-.2,1.6.8,1.6l.7.1V21H66.6v-.5c1.4-.1,1.6-.3,2.4-2.2L73.5,6.6l.5-.2,1.6,4.2c1,2.8,2,5.6,2.8,7.8.7,1.8,1,2,2.3,2.1V21H75.4l-.1-.5Zm-4.2-5.8H75L73,9.3Zm14.1,3.1c0,2.4.2,2.5,2.3,2.7V21H81.4v-.5c1.8-.1,2-.3,2-2.7V9.9c0-2.4-.2-2.5-1.9-2.7V6.7H87a5.56,5.56,0,0,1,3.6.9,3.48,3.48,0,0,1,1.4,3A4.49,4.49,0,0,1,87.7,15h-1l-1.6-.4v3.2Zm0-3.8a4.53,4.53,0,0,0,1.6.3c1.4,0,3.2-.7,3.2-3.6,0-2.4-1.2-3.3-3.5-3.3a3.75,3.75,0,0,0-1.1.1c-.1,0-.2.2-.2.6V14ZM97.5,6.7,102.8,18,108,6.7h3.6v.5c-1.9.2-2,.2-2,2.7l.2,7.9c.1,2.5.1,2.5,2.1,2.7V21h-5.8v-.5c1.9-.2,1.9-.2,1.9-2.7L107.9,9h-.1l-5.4,11.8h-.6L96.9,9.3l-.2,6.1a25.39,25.39,0,0,0,0,3.9c.1.8.6,1,2.1,1.1V21H93.6v-.5c1.2-.1,1.7-.3,1.8-1.1.2-1.4.3-2.8.4-4.2l.3-4.6c.2-2.9,0-3.2-2.1-3.3V6.7Zm24.1,13.8.7-.1c.8-.1.9-.3.7-1-.2-.5-.8-2.2-1.4-3.8h-4.4c-.2.6-.8,2.3-1.1,3.2-.4,1.3-.2,1.6.8,1.6l.7.1V21h-4.7v-.5c1.4-.1,1.6-.3,2.4-2.2l4.5-11.7.5-.2,1.6,4.2c1,2.8,2,5.6,2.8,7.8.7,1.8,1,2,2.3,2.1V21h-5.3l-.1-.5Zm-4.2-5.8h3.9l-1.9-5.4Zm23.3,6.4h-.6L130.6,9.5v5.6a29.54,29.54,0,0,0,.2,4.2c.1.8.7,1.1,2.1,1.1V21h-5.3v-.5c1.2,0,1.8-.4,1.9-1.1.1-1.4.2-2.8.2-4.2V10.4c0-1.6,0-1.9-.4-2.4a2.73,2.73,0,0,0-1.9-.8V6.7h3.2l9.2,11V12.5a29.54,29.54,0,0,0-.2-4.2c-.1-.8-.7-1.1-2.1-1.1V6.7h5.3v.5c-1.2,0-1.8.4-1.9,1.1-.1,1.4-.2,2.8-.2,4.2v8.6ZM154.8,6.7v.5c-1.8.1-1.9.3-1.9,2.7v4.6a7.43,7.43,0,0,0,.9,4.2,3.56,3.56,0,0,0,3.2,1.5,3.89,3.89,0,0,0,3.2-1.6,9.22,9.22,0,0,0,1-4.9V12.5c0-1.4-.1-2.8-.2-4.2-.1-.8-.7-1.1-2.1-1.1V6.7h5.3v.5c-1.2,0-1.8.4-1.9,1.1-.1,1.4-.2,2.8-.2,4.2V14c0,2.5-.4,4.3-1.7,5.7a6.17,6.17,0,0,1-7.6.5c-1.2-.9-1.7-2.4-1.7-4.9V9.9c0-2.4-.2-2.5-2-2.7V6.7Zm23.5,14.4h-.6L168.2,9.5v5.6a29.54,29.54,0,0,0,.2,4.2c.1.8.7,1.1,2.1,1.1V21h-5.3v-.5c1.2,0,1.8-.4,1.9-1.1.1-1.4.2-2.8.2-4.2V10.4c0-1.6,0-1.9-.4-2.4a2.28,2.28,0,0,0-1.9-.7V6.7h3.2l9.2,11V12.5a29.54,29.54,0,0,0-.2-4.2c-.1-.8-.7-1.1-2.1-1.1V6.7h5.3v.5c-1.2,0-1.8.4-1.9,1.1-.1,1.4-.2,2.8-.2,4.2v8.6Zm7.2-3.3c0,2.4.2,2.5,2,2.7V21h-5.8v-.5c1.8-.1,2-.3,2-2.7V9.9c0-2.4-.2-2.5-2-2.7V6.7h5.8v.5c-1.8.1-2,.3-2,2.7v7.9Zm9.7,3.3c-1.5-3.9-3.6-9.3-4.5-11.8-.7-1.8-1-2-2.3-2.1V6.7h5.3v.5l-.7.1c-.8.1-.9.3-.7,1,.6,1.6,2.3,5.9,3.9,10,1.1-3,3-8,3.5-9.4.4-1.2.2-1.5-.8-1.6l-.7-.1V6.7H203v.5c-1.5.2-1.7.3-2.5,2.2-.3.7-3,7.2-4.6,11.6l-.7.1ZM205.9,9.9c0-2.4-.2-2.5-1.9-2.7V6.7h9.6c0,.4.1,2,.2,3.2l-.6.1a3.86,3.86,0,0,0-.8-2c-.4-.4-1.1-.5-2.4-.5h-1.7c-.6,0-.7,0-.7.7v5h2.3c1.9,0,2-.1,2.2-1.8h.6v4.3h-.6a2.1,2.1,0,0,0-.5-1.5,2.49,2.49,0,0,0-1.7-.3h-2.2v3.9c0,1.2.1,1.9.6,2.2a5.58,5.58,0,0,0,2.2.3,4.33,4.33,0,0,0,2.8-.6,8.42,8.42,0,0,0,1.1-2.1l.6.1a33.83,33.83,0,0,1-.8,3.4H203.8v-.5c2-.1,2.1-.3,2.1-2.7v-8ZM220,17.8c0,2.4.2,2.5,2,2.7V21h-5.8v-.5c1.8-.1,2-.3,2-2.7V9.9c0-2.4-.2-2.5-1.9-2.7V6.7h5.6a6.23,6.23,0,0,1,3.5.8,3.13,3.13,0,0,1,1.4,2.8,4,4,0,0,1-2.9,3.8,31.46,31.46,0,0,0,2,3.1c.6.8,1.2,1.7,1.8,2.4a2.92,2.92,0,0,0,1.6,1.1v.4H229c-2.5-.1-3.3-.8-4.1-2-.7-1-1.6-2.6-2.2-3.6a1.6,1.6,0,0,0-1.4-.8H220Zm0-3.7h1.3a2.86,2.86,0,0,0,2.2-.6,3.6,3.6,0,0,0,1.3-2.9,3,3,0,0,0-2.9-3.2h-.4a4.87,4.87,0,0,0-1.2.1c-.1,0-.2.2-.2.6l-.1,6Zm10.6,3c.4,1,1.5,3.5,3.8,3.5a2.56,2.56,0,0,0,2.7-2.4v-.4c0-1.9-1.4-2.6-2.8-3.3-.7-.4-3.7-1.4-3.7-4,0-2.2,1.6-4,4.5-4a5.66,5.66,0,0,1,1.8.3,2.35,2.35,0,0,0,.8.2c.1.8.2,1.6.4,3l-.6.1c-.4-1.3-1-2.8-3-2.8a2.26,2.26,0,0,0-2.4,2.2v.2c0,1.6,1.2,2.3,2.8,3.1,1.4.6,3.8,1.5,3.8,4.3,0,2.5-2.1,4.4-4.9,4.4a7.61,7.61,0,0,1-2.1-.3c-.6-.2-.9-.4-1.2-.5-.2-.6-.4-2.1-.6-3.3Zm13.7.7c0,2.4.2,2.5,2,2.7V21h-5.8v-.5c1.8-.1,2-.3,2-2.7V9.9c0-2.4-.2-2.5-2-2.7V6.7h5.8v.5c-1.8.1-2,.3-2,2.7Zm10.4,0c0,2.4.2,2.5,2.3,2.7V21h-6.4v-.5c2.1-.1,2.2-.3,2.2-2.7V7.5h-1c-2,0-2.5.3-2.9.7a6.39,6.39,0,0,0-.8,1.9h-.6c.1-1.3.2-2.7.3-3.9h.3a1.08,1.08,0,0,0,1.1.6h9a1.1,1.1,0,0,0,1-.6h.3c0,.9.1,2.5.2,3.8h-.6a5,5,0,0,0-.8-2c-.4-.4-1-.6-2.4-.6h-1.5l.3,10.4Zm13.3,0c0,2.4.2,2.5,2.3,2.7V21H264v-.5c2-.1,2.2-.3,2.2-2.7V15.3a2.11,2.11,0,0,0-.5-1.3c-1-1.7-1.8-3.3-2.8-4.9s-1-1.7-2.3-1.8V6.7h5.3v.5l-1,.1c-.5.1-.7.3-.3,1,1,1.8,2,3.7,3.1,5.5.9-1.8,1.9-3.6,2.7-5.4.4-.8.2-1-.6-1.1l-.9-.1V6.7h4.8v.5c-1.5.1-1.6.4-2.5,1.9s-1.8,3-2.8,4.8a1.75,1.75,0,0,0-.4,1.2v2.7Z"/></g>
          </svg>
        </a>
      </div>

      #if ( $isUmbrellaCategory )
      <div class="secondary-logo">
        <a class="branded-logo" href="site://Chapman.edu/${umbrellaDirectoryPath}/index">${umbrellaBrandLabel}</a>
      </div>
      #end
    </div>
  </div>
#end

#macro ( buildPrimaryNavRightContainer )
      <div class="nav-container right-nav-container">
      #if (! $pagePath.contains('navsNoJS'))
        <div class="primary-nav-action utility-nav-trigger">
          <a tabindex="0" class="primary-nav-icon" aria-label="Access search navigation bar">
            <svg width="32" height="32" viewBox="0 0 16 16" class="icon-open-search">
              <g>
                <path d="M16 13.5l-4.695-4.695c0.444-0.837 0.695-1.792 0.695-2.805 0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.013 0 1.968-0.252 2.805-0.695l4.695 4.695 2.5-2.5zM2 6c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4z"></path>
                <path d="M9 5h-2v-2h-2v2h-2v2h2v2h2v-2h2z"></path>
              </g>
            </svg>
            <svg width="32" height="32" viewBox="0 0 16 16" class="icon-close-search hide">
              <g>
                <path d="M16 13.5l-4.695-4.695c0.444-0.837 0.695-1.792 0.695-2.805 0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.013 0 1.968-0.252 2.805-0.695l4.695 4.695 2.5-2.5zM2 6c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4z"></path>
                <path d="M3 5h6v2h-6v-2z"></path>
              </g>
            </svg>
          </a>
          <div class="nav-icon-text search">Find</div>
        </div>
        #end
    <div class="primary-nav-action login-trigger">
      <a tabindex="0" class="primary-nav-icon" role="button" aria-label="Access Chapman Systems">
        <svg width="32" height="32" viewBox="0 0 16 16">
          <g>
            <path d="M4 5c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4s-4-1.791-4-4zM12 10h-8c-2.209 0-4 1.791-4 4v1h16v-1c0-2.209-1.791-4-4-4z"/>
          </g>
        </svg>
      </a>
      <div class="nav-icon-text">Log in</div>
      <div class="login-menu">
        <ul>
          
          <li>
            <a href="https://blackboard.chapman.edu/">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
                <path d="M50.4 174.2C47.2 112.2 1 139.3 0 118.1c-0.5-8.2 4.5-6.7 7.7-7 1.7 0 5 1.2 26.2 0.2 39.1-2.2 76.5-5.7 113.9-7.7 110.9-6 114.4 60.8 114.9 70.6 1.5 29.4-13.5 54.6-45.4 66.3v1.7c56.1 10 73.8 33.7 76 74.3 3.2 60.3-35.4 100-108.7 104 -66.8 3.7-89.8 3.2-112.4 4.5 -11.5 0.5-22.7 3-32.4 3.5s-14.7 0.7-15-5.7c-0.7-14.7 38.9-5.5 36.7-49.4L50.4 174.2 50.4 174.2zM108.5 220.1c1.2 21.2 6.2 24.2 32.4 24.4l26.2-1.5c34.2-1.7 46.4-20.4 44.6-53.1 -2.5-42.4-36.6-68.3-77.3-66.1 -29.4 1.5-30.2 18-28.7 44.1L108.5 220.1 108.5 220.1zM115.5 350.5c2.2 42.4 14.5 54.9 58.3 52.4 44.1-2.5 65.3-32.9 62.8-77 -1.5-26.2-16.7-66.1-98.2-61.6 -26.2 1.5-27.2 13-25.9 35.7L115.5 350.5 115.5 350.5z"/>
                <path d="M321.9 138.1c-1.7-32.7-28.4-11.5-29.4-27.9 -0.5-11.5 20.9-6 61.8-34.4 3.2-1.7 4.7-3.5 8-3.7 5-0.2 3.7 9.7 4 13l9.7 177.8c17-17.2 35.9-32.9 58.6-34.2 52.1-2.7 74.3 41.6 75.8 72.8C514.1 370.1 477 408 421.6 411c-40.6 2.2-54.9-15-61.3-14.7 -8.2 0.5-12 18.7-21.9 19.2 -3.2 0.2-5-1.2-5.2-4.7 -0.2-3.2 2.5-13.2 1.2-36.2L321.9 138.1 321.9 138.1zM380.7 350.8c2 37.4 36.6 43.9 49.9 43.1 37.4-2 43.6-38.4 42.1-67.6 -1.7-34.2-19.9-65.8-62.3-63.6 -13 0.7-33.7 10-32.9 26.4L380.7 350.8 380.7 350.8z"/>
              </svg>
              Blackboard
            </a>
          </li>
          
          <li>
            <a href="https://chapman.joinhandshake.com/login/">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 82.3 97.8" style="enable-background:new 0 0 82.3 97.8;" xml:space="preserve">
                <style type="text/css">
                  .st0{fill:#FFFFFF;}
                </style>
                <path class="st0" d="M0.9,37.6c0-1.5,0.9-3.2,2.2-3.9c3.7-1.9,13.5-1.1,15.9-0.4c10.4,3,14.9,15.9,39.5,9.6c9.8-2.5,17.4-0.7,19-0.1  c2,0.8,3.4,2.1,3.4,4.6c0,8.1,0,27.7-0.1,41.4c0,4-3.3,7.3-7.3,7.3c-4.9,0-10.8,0-15.3-0.1c-4,0-7.3-3.3-7.3-7.3  c0-8.5-0.2-18.3-0.4-26.8c-0.2-7.7-7.8-13.2-17.6-10.7c-1.1,0.3-1.6,0.5-1.6,1.4c0,2.4-0.2,23.6-0.3,36.1c0,4-3.3,7.3-7.4,7.3  L8.1,96c-4.1,0-7.4-3.3-7.4-7.4C0.8,74.5,0.9,44.3,0.9,37.6"/>
                <path class="st0" d="M81,23.3c0,7.5-6.1,13.6-13.6,13.6c-7.5,0-13.6-6.1-13.6-13.6c0-7.5,6.1-13.6,13.6-13.6  C74.9,9.7,81,15.8,81,23.3"/>
                <path class="st0" d="M29.5,14.3c0,7.9-6.4,14.3-14.3,14.3c-7.9,0-14.3-6.4-14.3-14.3C0.9,6.4,7.3,0,15.2,0  C23.1,0,29.5,6.4,29.5,14.3"/>
              </svg>
              Handshake
            </a>
          </li>
          
          <li>
            <a href="https://my.chapman.edu/">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 28.1 28.1">
                <style type="text/css">
                  .st0{fill:#ffffff;}
                </style>
                <polygon class="st0" points="13 14.5 0 27.5 0 14.5 "/>
                <polygon class="st0" points="0 13.6 0 0.6 13 13.6 "/>
                <polygon class="st0" points="27.5 0 14.5 13 14.5 0 "/>
                <polygon class="st0" points="13.6 13 0.6 0 13.6 0 "/>
                <polygon class="st0" points="15.1 13.6 28.1 0.6 28.1 13.6 "/>
                <polygon class="st0" points="28.1 14.5 28.1 27.5 15.1 14.5 "/>
                <polygon class="st0" points="13.6 15 0.6 28.1 13.6 28.1 "/>
                <polygon class="st0" points="14.5 15 14.5 28.1 27.5 28.1 "/>
              </svg>
              My Chapman
            </a>
          </li>

          <li>
            <a href="https://www.chapman.edu/panthermail/">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 448">
                <path d="M416 376V184c-5.2 6-11 11.5-17.2 16.5C363 228 327 256 292.2 285c-18.8 15.8-42 35-68 35h-0.5c-26 0-49.2-19.2-68-35C121 256 85 228 49.2 200.5c-6.2-5-12-10.5-17.2-16.5v192c0 4.2 3.8 8 8 8h368C412.2 384 416 380.2 416 376zM416 113.2c0-6.2 1.5-17.2-8-17.2H40c-4.2 0-8 3.8-8 8 0 28.5 14.2 53.2 36.8 71 33.5 26.2 67 52.8 100.2 79.2 13.2 10.8 37.2 33.8 54.8 33.8h0.5c17.5 0 41.5-23 54.8-33.8 33.2-26.5 66.8-53 100.2-79.2C395.5 162.2 416 134.5 416 113.2zM448 104v272c0 22-18 40-40 40H40c-22 0-40-18-40-40V104c0-22 18-40 40-40h368C430 64 448 82 448 104z"/>
              </svg>
              PantherMail
            </a>
          </li>
          
          <li>
            <a href="https://exchange.chapman.edu/">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 448">
                <path d="M416 376V184c-5.2 6-11 11.5-17.2 16.5C363 228 327 256 292.2 285c-18.8 15.8-42 35-68 35h-0.5c-26 0-49.2-19.2-68-35C121 256 85 228 49.2 200.5c-6.2-5-12-10.5-17.2-16.5v192c0 4.2 3.8 8 8 8h368C412.2 384 416 380.2 416 376zM416 113.2c0-6.2 1.5-17.2-8-17.2H40c-4.2 0-8 3.8-8 8 0 28.5 14.2 53.2 36.8 71 33.5 26.2 67 52.8 100.2 79.2 13.2 10.8 37.2 33.8 54.8 33.8h0.5c17.5 0 41.5-23 54.8-33.8 33.2-26.5 66.8-53 100.2-79.2C395.5 162.2 416 134.5 416 113.2zM448 104v272c0 22-18 40-40 40H40c-22 0-40-18-40-40V104c0-22 18-40 40-40h368C430 64 448 82 448 104z"/>
              </svg>
              Staff &amp; Faculty Email
            </a>
          </li>
          
        </ul>
      </div>
    </div>
  </div>
#end

#macro ( buildPrimaryNavSearchBox )
  <div class="nav-container" id="primary-nav-search">
    #buildSearchBox()
  </div>
#end

##
## Global Nav Macros
##
#macro( buildGlobalNav )
  <div class="nav-container global-nav">
    <div id="cu-global-nav">
      <nav aria-label="global navigation">
        <ul class="global-nav-links">
          #foreach( $link in $globalNavLinks )
            <li class="primary-link">
              #if( $link.dropdown.size() > 0 )
                <a tabindex="0">$link.sectionTitle</a>
                #buildGlobalNavDropdown( $link.dropdown $link.sectionLink)
              #else
                ## Primary links with no dropdown have a link with the title
                <a href="site://Chapman.edu/$link.sectionLink">$link.sectionTitle</a>
              #end
            </li>
          #end
        </ul>
      </nav>
    </div>
  </div>
#end

#macro( buildGlobalNavDropdown $dropdownLinks $overviewLink)
  ## Law global nav dropdowns don't have icons
  #if( $umbrellaDirectory != 'law' )
    #set ( $overviewIconClass = "icon-file-text" )
  #else
    #set ( $overviewIconClass = "" )
  #end

  <div class="global-nav-dropdown">
    <ul>
      ## First list item is always Overview
      <li>
        #set ( $parentPage = "" )
            #foreach ( $word in $overviewLink.split("/")[1].split("-") )
              #if ( $parentPage != "" )
                #set ( $parentPage = $parentPage + " " )
              #end
          
            #if( $umbrellaDirectory != 'law' )
              #set ( $parentPage = $parentPage + $word.substring(0,1).toUpperCase() + $word.substring(1) )
            #else
              #set ( $parentPage = $link.sectionTitle )
            #end
        #end
        <a class="icon $overviewIconClass" href="site://Chapman.edu/$overviewLink">$parentPage Overview</a>
      </li>
      #foreach( $dropdownLink in $dropdownLinks )
        #set ($defaultLinkName = "${_EscapeTool.xml( $dropdownLink.text )}")
          <li>
          #if($dropdownLink.link.toString().contains("http"))
            <a class="icon $dropdownLink.iconClass" href="$dropdownLink.link">
          #elseif($dropdownLink.link.toString().contains("alumni/events/index"))
            <a class="icon $dropdownLink.iconClass" href="$dropdownLink.link" aria-label="Alumni events">
          #elseif($dropdownLink.link.toString().contains("alumni/get-involved/index"))
            <a class="icon $dropdownLink.iconClass" href="$dropdownLink.link" aria-label="Alumni: Get Involved">
          #elseif($dropdownLink.link.toString().contains("support-chapman/get-involved"))
            <a class="icon $dropdownLink.iconClass" href="$dropdownLink.link" aria-label="Support Chapman: Get Involved">
          #elseif($dropdownLink.link.toString().contains("about/connect/index"))
            <a class="icon $dropdownLink.iconClass" href="$dropdownLink.link" aria-label="Connect with Chapman">
          #else
            <a class="icon $dropdownLink.iconClass" href="site://Chapman.edu/$dropdownLink.link">          
          #end
            ${_EscapeTool.xml( $dropdownLink.text )}
          </a>
        </li>
      #end
    </ul>
  </div>
#end

##
## Utility Nav Macros
##
#macro ( buildUtilityNav )
  <div class="utility-nav">
    <nav aria-label="utility navigation bar">
      #buildUtilityNavLinks()
      #buildSearchComponent()
    </nav>
  </div>
#end

#macro ( buildUtilityNavLinks )
  <div class="utility-nav-container utility-links">
    <ul class="utility-list">
      <li class="utility-cell utility-has-dropdown">
        <a href="#">Find information for</a>
        <div class="utility-dropdown dropdown">
          <ul>
            <li><a href="site://Chapman.edu/future-students/index">Prospective Students</a></li>
            <li><a href="site://Chapman.edu/students/index">Current Students</a></li>
            <li><a href="site://Chapman.edu/alumni/index">Alumni</a></li>
            <li><a href="site://Chapman.edu/faculty-staff/index">Faculty &amp; Staff</a></li>
            <li><a href="site://Chapman.edu/families/index">Parents &amp; Families</a></li>
          </ul>
        </div>
      </li>
      <li class="utility-cell"><a href="site://Chapman.edu/academics/degrees-and-programs">Degrees &amp; Programs</a></li>
      <li class="utility-cell"><a href="site://Chapman.edu/about/maps-directions/index">Maps &amp; Directions</a></li>
      <li class="utility-cell"><a href="site://Chapman.edu/directory/index">All Directories</a></li>
      <li class="utility-cell"><a href="https://news.chapman.edu/" aria-label="Chapman Newsroom">News</a></li>
      <li class="utility-cell"><a href="https://events.chapman.edu/" aria-label="Chapman Events">Events</a></li>
      <li class="utility-cell utility-has-dropdown">
        <a href="#" role="listbox" aria-label="Social listbox">Social</a>
        <div class="utility-dropdown social-dropdown dropdown">
          <ul>
            <li>
              <ul class="social-list">
                #buildSocialMenuItem('facebook')
                #buildSocialMenuItem('twitter')
                #buildSocialMenuItem('pinterest')
                #buildSocialMenuItem('instagram')
                #buildSocialMenuItem('youtube')
                #buildSocialMenuItem('linkedin')
                #buildSocialMenuItem('snapchat')
                #buildSocialMenuItem('tumblr')
                #buildSocialMenuItem('itunes')
              </ul>
            </li>
            <li><a class="social-link" href="https://social.chapman.edu/">Social hub</a></li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
#end

#macro ( buildSearchComponent )
  #set ($searchFilters = ["All", "Blog Stories", "Faculty Directory", "Events", "Main Website"])

  <div class="utility-nav-container utility-search" id="utility-nav-search">
    <ul class="utility-list">
      <li class="utility-cell search-type utility-has-dropdown">
        <a tabindex="0" class="selected-search-filter">Search From</a>
        <div class="utility-dropdown dropdown">
          <ul>
            #foreach ($filter in $searchFilters)
              <li class="search-filter-option"><a tabindex="0">$filter</a></li>
            #end
          </ul>
        </div>
      </li>
      <li class="utility-cell">
        #buildSearchBox()
      </li>
    </ul>
  </div>
#end

#macro ( buildSocialMenuItem $service )
  ## Hardcoded Settings
  #set ( $socialMediaUrls = {
    'facebook' : 'https://www.facebook.com/ChapmanUniversity',
    'twitter' : 'https://twitter.com/chapmanu',
    'pinterest' : 'https://www.pinterest.com/chapmanu/',
    'instagram' : 'https://www.instagram.com/chapmanu/',
    'youtube' : 'https://www.youtube.com/user/ChapmanUniversity',
    'linkedin' : 'https://www.linkedin.com/edu/school?id=17838',
    'snapchat' : 'https://www.snapchat.com/add/chapmanu',
    'tumblr' : 'http://chapmanadmission.tumblr.com/',
    'itunes' : 'http://itunes.apple.com/us/institution/chapman-university/id430678922',
    'social hub' : 'https://social.chapman.edu/'
  })
  #set ( $socialMediaIconSvgPath = {
    'facebook' : '<path d="M19 6h5v-6h-5c-3.9 0-7 3.1-7 7v3h-4v6h4v16h6v-16h5l1-6h-6v-3c0-0.5 0.5-1 1-1z"/>',
    'twitter' : '<path d="M32 7.1c-1.2 0.5-2.4 0.9-3.8 1 1.4-0.8 2.4-2.1 2.9-3.6-1.3 0.8-2.7 1.3-4.2 1.6-1.2-1.3-2.9-2.1-4.8-2.1-3.6 0-6.6 2.9-6.6 6.6 0 0.5 0.1 1 0.2 1.5-5.5-0.3-10.3-2.9-13.5-6.9-0.6 1-0.9 2.1-0.9 3.3 0 2.3 1.2 4.3 2.9 5.5-1.1 0-2.1-0.3-3-0.8 0 0 0 0.1 0 0.1 0 3.2 2.3 5.8 5.3 6.4-0.5 0.2-1.1 0.2-1.7 0.2-0.4 0-0.8 0-1.2-0.1 0.8 2.6 3.3 4.5 6.1 4.6-2.2 1.8-5.1 2.8-8.2 2.8-0.5 0-1 0-1.6-0.1 2.9 1.9 6.4 3 10.1 3 12.1 0 18.7-10 18.7-18.7 0-0.3 0-0.6 0-0.8 1.3-0.9 2.4-2.1 3.3-3.4z"/>',
    'pinterest' : '<path d="M16 0c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zM16 29.9c-1.4 0-2.8-0.2-4.1-0.6 0.6-0.9 1.4-2.4 1.7-3.6 0.2-0.6 0.9-3.3 0.9-3.3 0.5 0.9 1.8 1.6 3.2 1.6 4.2 0 7.2-3.8 7.2-8.6 0-4.6-3.7-8-8.5-8-6 0-9.2 4-9.2 8.4 0 2 1.1 4.6 2.8 5.4 0.3 0.1 0.4 0.1 0.5-0.2 0-0.2 0.3-1.1 0.4-1.6 0-0.1 0-0.3-0.1-0.4-0.6-0.7-1-2-1-3.2 0-3.1 2.3-6 6.3-6 3.4 0 5.8 2.3 5.8 5.6 0 3.8-1.9 6.4-4.4 6.4-1.4 0-2.4-1.1-2-2.5 0.4-1.6 1.2-3.4 1.2-4.6 0-1.1-0.6-1.9-1.8-1.9-1.4 0-2.5 1.4-2.5 3.4 0 1.2 0.4 2.1 0.4 2.1s-1.4 5.8-1.6 6.9c-0.3 1.2-0.2 2.9 0 4-5.2-2-8.8-7-8.8-12.9 0-7.7 6.2-13.9 13.9-13.9s13.9 6.2 13.9 13.9c0 7.7-6.2 13.9-13.9 13.9z"/>',
    'instagram' : '<path d="M16 2.9c4.3 0 4.8 0 6.5 0.1 1.6 0.1 2.4 0.3 3 0.6 0.7 0.3 1.3 0.6 1.8 1.2 0.6 0.6 0.9 1.1 1.2 1.8 0.2 0.6 0.5 1.4 0.6 3 0.1 1.7 0.1 2.2 0.1 6.5s0 4.8-0.1 6.5c-0.1 1.6-0.3 2.4-0.5 3-0.3 0.7-0.6 1.3-1.2 1.8-0.6 0.6-1.1 0.9-1.8 1.2-0.6 0.2-1.4 0.5-3 0.6-1.7 0.1-2.2 0.1-6.5 0.1s-4.8 0-6.5-0.1c-1.6-0.1-2.4-0.3-3-0.5-0.7-0.3-1.3-0.6-1.8-1.2-0.6-0.6-0.9-1.1-1.2-1.8-0.2-0.6-0.5-1.4-0.5-3-0.1-1.7-0.1-2.2-0.1-6.5s0-4.8 0.1-6.5c0.1-1.6 0.3-2.4 0.6-3 0.3-0.7 0.6-1.3 1.2-1.8 0.6-0.6 1.1-0.9 1.8-1.2 0.6-0.2 1.4-0.5 3-0.5 1.7-0.1 2.2-0.1 6.5-0.1zM16 0c-4.3 0-4.9 0-6.6 0.1-1.7 0.1-2.9 0.4-3.9 0.7-1.1 0.4-1.9 1-2.8 1.9-0.9 0.9-1.4 1.8-1.8 2.8-0.4 1-0.7 2.2-0.7 3.9-0.1 1.7-0.1 2.3-0.1 6.6s0 4.9 0.1 6.6c0.1 1.7 0.4 2.9 0.7 3.9 0.4 1.1 1 2 1.9 2.8 0.9 0.9 1.8 1.4 2.8 1.8 1 0.4 2.2 0.7 3.9 0.7 1.7 0.1 2.3 0.1 6.6 0.1s4.9 0 6.6-0.1c1.7-0.1 2.9-0.3 3.9-0.7 1.1-0.4 1.9-1 2.8-1.8s1.4-1.8 1.8-2.8c0.4-1 0.7-2.2 0.7-3.9 0.1-1.7 0.1-2.2 0.1-6.6s0-4.9-0.1-6.6c-0.1-1.7-0.3-2.9-0.7-3.9-0.4-1.1-0.9-2-1.8-2.8-0.9-0.9-1.8-1.4-2.8-1.8-1-0.4-2.2-0.7-3.9-0.7-1.7-0.1-2.3-0.1-6.6-0.1v0z"/><path d="M16 7.8c-4.5 0-8.2 3.7-8.2 8.2s3.7 8.2 8.2 8.2 8.2-3.7 8.2-8.2c0-4.5-3.7-8.2-8.2-8.2zM16 21.3c-2.9 0-5.3-2.4-5.3-5.3s2.4-5.3 5.3-5.3c2.9 0 5.3 2.4 5.3 5.3s-2.4 5.3-5.3 5.3z"/><path d="M26.5 7.5c0 1.1-0.9 1.9-1.9 1.9s-1.9-0.9-1.9-1.9c0-1.1 0.9-1.9 1.9-1.9s1.9 0.9 1.9 1.9z"/>',
    'youtube' : '<path d="M31.6,10.1c0,0-0.3-2.2-1.3-3.2c-1.2-1.3-2.6-1.3-3.2-1.3c-4.4-0.4-11.2-0.4-11.2-0.4l0,0c0,0-6.7,0-11.2,0.4c-0.6,0.1-2,0.1-3.2,1.3c-1,1-1.3,3.2-1.3,3.2S0,12.7,0,15.3v2.4c0,2.6,0.4,5.2,0.4,5.2S0.6,25,1.6,26c1.2,1.3,2.8,1.3,3.5,1.3C7.6,27.5,16,27.7,16,27.7s6.7,0,11.2-0.4c0.6-0.1,2-0.1,3.2-1.3c1-1,1.3-3.2,1.3-3.2s0.4-2.6,0.4-5.2v-2.4C31.9,12.7,31.6,10.1,31.6,10.1L31.6,10.1z M12.6,20.6v-9l8.6,4.5L12.6,20.6L12.6,20.6z"/>',
    'linkedin' : '<path d="M12 12h5.5v2.8h0.1c0.8-1.4 2.7-2.8 5.5-2.8 5.8 0 6.9 3.6 6.9 8.4v9.6h-5.8v-8.5c0-2 0-4.7-3-4.7-3 0-3.5 2.2-3.5 4.5v8.7h-5.8v-18z"/><path d="M2 12h6v18h-6v-18z"/><path d="M8 7c0 1.7-1.3 3-3 3s-3-1.3-3-3c0-1.7 1.3-3 3-3s3 1.3 3 3z"/>',
    'snapchat' : '<path d="M16.5,1.4c3.4,0,6.3,1.9,7.7,4.9c0.5,0.9,0.5,2.4,0.5,3.4c0,1.2-0.1,2.4-0.2,3.6c0.2,0.1,0.4,0.1,0.5,0.1c0.6,0,1.3-0.5,1.9-0.5c0.6,0,1.6,0.5,1.6,1.2c0,1.8-3.8,1.5-3.8,3.1c0,0.3,0.1,0.5,0.2,0.8c0.9,2,2.6,3.9,4.6,4.7c0.5,0.2,1,0.4,1.5,0.5c0.4,0.1,0.5,0.4,0.5,0.6c0,1.3-3.3,1.8-4.2,1.9c-0.4,0.5-0.1,2-1.1,2c-0.8,0-1.6-0.3-2.4-0.3c-0.4,0-0.8,0-1.2,0.1c-2.2,0.5-3,3-6.7,3c-3.6,0-4.5-2.5-6.7-2.8c-0.4-0.1-0.8-0.1-1.2-0.1c-0.8,0-1.6,0.3-2.4,0.3c-1.1,0-0.7-1.4-1.1-2c-0.9-0.1-4.2-0.6-4.2-1.9c0-0.4,0.2-0.5,0.5-0.6c0.5-0.1,1-0.2,1.6-0.5c2-0.8,3.8-2.7,4.6-4.7c0.1-0.3,0.2-0.5,0.2-0.8c0-1.6-3.8-1.3-3.8-3.1c0-0.7,0.9-1.2,1.5-1.2c0.5,0,1.2,0.5,1.9,0.5c0.2,0,0.5,0,0.6-0.1C7.7,12.2,7.6,11,7.6,9.8c0-1,0.1-2.5,0.5-3.4C9.8,2.7,12.6,1.4,16.5,1.4z"/>',
    'tumblr' : '<path d="M17.9,14v7.3c0,1.9,0,2.9,0.2,3.5c0.2,0.5,0.7,1.1,1.2,1.4c0.7,0.4,1.5,0.6,2.4,0.6c1.6,0,2.6-0.2,4.2-1.3v4.8c-1.4,0.6-2.6,1-3.7,1.3c-1.1,0.3-2.3,0.4-3.6,0.4c-1.5,0-2.3-0.2-3.5-0.6C14,31,13,30.5,12.2,29.8s-1.3-1.4-1.7-2.2c-0.3-0.8-0.5-1.9-0.5-3.4V13.1H5.9V8.6c1.3-0.4,2.7-1,3.6-1.8s1.6-1.7,2.2-2.7c0.5-1.1,0.8-2.4,1-4.1h5.2v8h8v6H17.9z"/>',
    'itunes' : '<path d="M30,0h2v23c0,2.8-3.1,5-7,5s-7-2.2-7-5s3.1-5,7-5c2,0,3.7,0.6,5,1.5V8l-16,3.6V27c0,2.8-3.1,5-7,5s-7-2.2-7-5s3.1-5,7-5c2,0,3.7,0.6,5,1.5V4L30,0z"/>',
    'social hub' : ''
  })

  #set ( $socialHref = $socialMediaUrls[$service] )
  #set ( $svgPath = $socialMediaIconSvgPath[$service] )

  <li class="social-media-menu-item">
    <a href="$socialHref" target="_blank">
      <svg class="icon icon-$service"
           xlink="http://www.w3.org/2000/svg"
           width="32"
           height="32"
           viewBox="0 0 32 32">
        <title>$service</title>
        $svgPath
      </svg>
    </a>
  </li>
#end


##
## Off-Canvas Nav Macros
##
#macro ( buildOffCanvasNav )
  <div class="off-canvas-overlay" id="js-off-canvas-overlay"></div>
  <div class="off-canvas-nav-container" id="js-off-canvas-nav-container">
    #buildOffCanvasNavHeader()
    #buildOffCanvasNavMenus()
  </div>
#end

#macro ( buildOffCanvasNavHeader )
  <div class="cu-off-canvas-header">
    <div class="cu-logo-wrapper">
      #if ( $isUmbrellaCategory )
        <div id="umbrella-logo" class="toggle-logo">
          <a class="off-logo" href="site://Chapman.edu/${umbrellaDirectoryPath}/index" title="${umbrellaBrandLabel}">
            <!-- logo set as background image by class -->
            ${umbrellaBrandLabel} Logo
          </a>
          #buildOffCanvasNavCloseIcon()
        </div>
      #end

      <div id="main-logo" class="toggle-logo">
        <a class="default off-logo" href="site://Chapman.edu/index" title="Chapman University Website Home Page">
          <!-- logo set as background image by class -->
          Chapman University Logo
        </a>
        #buildOffCanvasNavCloseIcon()
      </div>
    </div>
  </div>
#end

#macro ( buildOffCanvasNavMenus )
  ## For umbrella cats, build secondary menu.
  <div class="off-canvas-nav clearfix" id="js-off-canvas-nav">
    #if ( $isUmbrellaCategory )
      #buildOffCanvasNavSecondaryMenu()
    #end

    #buildOffCanvasNavMainMenu()
  </div>
#end

#macro ( buildOffCanvasNavMainMenu )
  <div id="off-canvas-main" class="off-canvas-menu">
    <div class="menu-header">
      <span class="menu-label">Main Menu</span>

      #if ( $isUmbrellaCategory )
        <a class="toggle-menu-label" href="#">&lt; ${umbrellaLabel} Menu</a>
      #end
    </div>

    <ul>
      <li>
        <a href="site://Chapman.edu/about/index">About</a>
        #buildToggleIcon("About")
        <ul>
          <li><a href="site://Chapman.edu/about/maps-directions/index">Maps &amp; Directions</a></li>
          <li><a href="site://Chapman.edu/about/visit/index">Visit Chapman</a></li>
          <li><a href="site://Chapman.edu/about/facts-and-rankings/index">Facts &amp; Rankings</a></li>
          <li><a href="site://Chapman.edu/about/our-family/leadership/index">Leadership</a></li>
          <li><a href="site://Chapman.edu/campus-services/index">Campus Services</a></li>
          <li><a href="site://Chapman.edu/about/connect/index">Connect</a></li>
        </ul>
      </li>
      <li>
        <a href="site://Chapman.edu/academics/index">Academics</a>
        #buildToggleIcon("Academics")
        <ul>
          <li><a href="site://Chapman.edu/academics/degrees-and-programs">Degrees &amp; Programs</a></li>
          <li><a href="site://Chapman.edu/academics/schools-colleges">Schools &amp; Colleges</a></li>
          <li><a href="site://Chapman.edu/academics/academic-calendar">Academic Calendar</a></li>
          <li><a href="site://Chapman.edu/our-faculty/index">Faculty Directory</a></li>
          <li><a href="site://Chapman.edu/academics/libraries/index">Libraries</a></li>
          <li><a href="site://Chapman.edu/academics/course-catalogs/index">Course Catalogs</a></li>
          <li><a href="site://Chapman.edu/international-studies/index">International Study</a></li>
        </ul>
      </li>
      <li>
        <a href="site://Chapman.edu/admission/index">Admission</a>
        #buildToggleIcon("Admission")
        <ul>
          <li><a href="site://Chapman.edu/admission/undergraduate/index">Undergraduate Admission</a></li>
          <li><a href="site://Chapman.edu/admission/undergraduate/how-to-apply/index">Undergraduate Application</a></li>
          <li><a href="site://Chapman.edu/admission/graduate/index">Graduate Admission</a></li>
          <li><a href="site://Chapman.edu/admission/graduate/applynow">Graduate Application</a></li>
          <li><a href="site://Chapman.edu/admission/undergraduate/afford">Affordability</a></li>
          <li><a href="site://Chapman.edu/students/tuition-and-aid/financial-aid/undergraduate/net-cost-calculator/index">Financial Aid Calculator</a></li>
          <li><a href="site://Chapman.edu/admission/undergraduate/visit">Campus Tours</a></li>
        </ul>
      </li>
      <li>
        <a href="site://Chapman.edu/alumni/index">Alumni</a>
        #buildToggleIcon("Alumni")
        <ul>
          <li><a href="site://Chapman.edu/alumni/events/index" aria-label="Alumni Events">Events</a></li>
          <li><a href="site://Chapman.edu/alumni/get-involved/index" aria-label="Alumni: Get Involved">Get Involved</a></li>
          <li><a href="site://Chapman.edu/campus-services/career-professional-development/index">Career Support</a></li>
        </ul>
      </li>
      <li><a href="site://Chapman.edu/arts/index">Arts</a></li>
      <li>
        <a href="site://Chapman.edu/campus-life/index">Campus Life</a>
        #buildToggleIcon("Campus Life")
        <ul>
          <li><a href="http://www.chapmanathletics.com/landing/index">Athletics</a></li>
          <li><a href="site://Chapman.edu/diversity/index">Diversity &amp; Inclusion</a></li>
          <li><a href="https://events.chapman.edu/" aria-label="Chapman Events">Events</a></li>
          <li><a href="site://Chapman.edu/campus-life/fish-interfaith-center/index">Fish Interfaith Center</a></li>
          <li><a href="site://Chapman.edu/students/health-and-safety/index">Health &amp; Safety</a></li>
          <li><a href="site://Chapman.edu/students/services/housing-and-residence/index">Residence Life</a></li>
          <li><a href="site://Chapman.edu/students/life/index">Student Life</a></li>
        </ul>
      </li>
      <li>
        <a href="site://Chapman.edu/research/">Research</a>
        #buildToggleIcon("Research")
        <ul>
          <li><a href="site://Chapman.edu/research/sponsored-projects-services/pre-award/index">Pre-Award Administration</a></li>
          <li><a href="site://Chapman.edu/research/sponsored-projects-services/post-award/index">Post-Award Administration</a></li>
          <li><a href="site://Chapman.edu/research/integrity/index">Research Integrity</a></li>
          <li><a href="site://Chapman.edu/research/institutes-and-centers/index">Institutes &amp; Centers</a></li>
          <li><a href="site://Chapman.edu/research/center-for-undergraduate-excellence/index">Center for Undergraduate Excellence</a></li>
          <li><a href="site://Chapman.edu/research/graduate-research/index">Graduate Research Support</a></li>
        </ul>
      </li>
      <li>
        <a href="site://Chapman.edu/support-chapman/index">Support</a>
        #buildToggleIcon("Support")
        <ul>
          <li><a href="site://Chapman.edu/support-chapman/contact-us">Contact Development</a></li>
          <li><a href="site://Chapman.edu/support-chapman/get-involved" aria-label="Support: Involvement Opportunities">Get Involved</a></li>
          <li><a href="site://Chapman.edu/support-chapman/ways-to-give/areas-to-support">Areas to Support</a></li>
          <li><a href="site://Chapman.edu/alumni/get-involved/index" aria-label="Alumni: Get Involved">Get Involved</a></li>
        </ul>
      </li>
    </ul>

    <div class="off-canvas-utility">
      <ul>
        <li>
          <a href="site://Chapman.edu/audiences/index">Find information for...</a>
          #buildToggleIcon("Find Information By Audience")
          <ul>
            <li><a href="site://Chapman.edu/future-students/index">Prospective Students</a></li>
            <li><a href="site://Chapman.edu/students/index">Current Students</a></li>
            <li><a href="site://Chapman.edu/alumni/index">Alumni</a></li>
            <li><a href="site://Chapman.edu/faculty-staff/index">Faculty &amp; Staff</a></li>
            <li><a href="site://Chapman.edu/families/index">Parents &amp; Families</a></li>
          </ul>
        </li>
        <li><a href="site://Chapman.edu/academics/degrees-and-programs">Degrees &amp; Programs</a></li>
        <li><a href="site://Chapman.edu/about/maps-directions/index">Maps &amp; Directions</a></li>
        <li><a href="site://Chapman.edu/directory/index">All Directories</a></li>
        <li><a href="https://news.chapman.edu/" aria-label="Chapman Newsroom">News</a></li>
        <li><a href="https://events.chapman.edu/" aria-label="Chapman Events">Events</a></li>
        <li><a href="https://social.chapman.edu/" aria-label="Chapman Social Hub">Social</a></li>
      </ul>
    </div>
  </div>
#end

#macro ( buildOffCanvasNavSecondaryMenu )
  <div id="off-canvas-umbrella" class="off-canvas-menu">
    <div class="menu-header">
      <span class="menu-label">${umbrellaLabel}</span>
      <a class="toggle-menu-label" href="#">Main Menu &gt;</a>
    </div>

    <ul>
      #foreach ( $asset in $umbrellaAssets )
        #buildSecondaryMenuItem( $asset )
      #end
    </ul>
  </div>
#end

#macro ( buildSecondaryMenuItem $asset )
  ## This builds a menu link for the secondary menu. It will either be a link or a
  ## drop-down menu with multiple links.
  ## The setUmbrellaAssets macro already filters out hidden assets
  #set ( $assetType = $asset.assetType )

  #if ( $assetType == 'page' )
    <li><a href="site://Chapman.edu/${asset.path}">${_EscapeTool.xml($asset.metadata.displayName)}</a></li>

  #elseif ( $assetType == 'symlink' )
    <li><a href="site://Chapman.edu/${asset.path}">${_EscapeTool.xml($asset.label)} <span class="fas fa-external-link-alt"></span></a></li>

  #elseif ( $assetType == 'folder' )
    ## Collect folder's visible children.
    #set ( $visibleChildren = [] )

    #foreach( $childAsset in $asset.children )
      ## By default, set visibility to false
      #set ( $isVisibleChild = false )
      ## Since a symLink (External Link added to folders) can't be set by user to Hidden, set visibility to true:
      #if ( $childAsset.assetType == 'symlink' )
        #set ( $isVisibleChild = true ) 
      #end
      #if ( $childAsset.assetType == 'folder')
          ## Both the folder and index page must be visible
          #set ( $folderVisible = $childAsset.metadata.getDynamicField('Hide from navigation').value != "Yes" )
          #set ( $folderIndexPage = $_.locatePage("${childAsset.path}/index" ) )
          #set ( $folderIndexVisible = $folderIndexPage.metadata.getDynamicField('Hide from navigation').value != "Yes" )

          #if ( $folderIndexVisible && $folderVisible )
              #set ( $isVisibleChild = true )
          #end
      #elseif ( $childAsset.assetType == 'page' && ($childAsset.name != 'index') )
          #set ( $isVisibleChild = $childAsset.metadata.getDynamicField('Hide from navigation').value != "Yes" )
      #end

      #if ( $isVisibleChild )
          #set ( $discard = $visibleChildren.add($childAsset) )
      #end
    #end

    ## Link for folder. Include drop-down if folder has visible children.
    <li>
      <a href="site://Chapman.edu/${asset.path}/index">${_EscapeTool.xml($asset.metadata.displayName)}</a>

      #if ( $visibleChildren.size() > 0 )
        #buildToggleIcon($asset.metadata.displayName)
        <ul>
          #foreach ( $child in $visibleChildren )
            #if ( $child.assetType == "page" )
              <li><a href="site://Chapman.edu/${child.path}">${_EscapeTool.xml($child.metadata.displayName)}</a></li>
            #elseif ( $child.assetType == "symlink" )
              <li><a href="site://Chapman.edu/${child.path}">${_EscapeTool.xml($child.label)} <span class="fas fa-external-link-alt"></span></a></li>
            #elseif ( $child.assetType == "folder" )
              <li><a href="site://Chapman.edu/${child.path}/index">${_EscapeTool.xml($child.metadata.displayName)}</a></li>
            #end
          #end
        </ul>
      #end
    </li>
  #end
#end

#macro ( buildToggleIcon $displayName )
  <span class="toggle">
    <span>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
        <title>Toggle ${_EscapeTool.xml($displayName)}</title>
        <path d="M480 224h-192v-192h-64v192h-192v64h192v192h64v-192h192z"></path>
      </svg>
    </span>
  </span>
#end

#macro ( buildOffCanvasNavCloseIcon )
  <span tabindex="0" class="close js-close-off-canvas-nav">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 512 512">
      <title>Close</title>
      <path d="M446.627 110.627l-45.254-45.254-145.373 145.372-145.373-145.372-45.254 45.253 145.373 145.374-145.373 145.373 45.254 45.254 145.373-145.373 145.373 145.373 45.254-45.255-145.372-145.372z"></path>
    </svg>
  </span>
#end


##
## Helper Macros
##
#macro( buildSearchBox )
  <div class="cu-search-box"></div>
  <div class="search-results-container">
    <div class="cu-search-results"></div>
  </div>
#end

#macro( debugUmbrellaAssets )
  #foreach ( $asset in $umbrellaAssets )
    <!-- $asset.name : $asset.path ($asset.children.size()) -->
  #end
#end


##
## Main OmniNav HTML Block
##
#setVars()
#buildOmniNav()


## Browser Upgrade Alert 
<div class="upgrade-browser-wrapper">
    <input type="checkbox" id="upgrade-hide"/>
    <label for="upgrade-hide" class="upgrade-notice dismiss">
        <a class="fa fa-window-close no-underline" aria-hidden="true">
        <span class="sr-only">dismiss alert</span>
        </a>
    </label>
    <br/>
    <div id="upgrade-browser">
        <p class="inner">
            Please update your browser for the best viewing experience.
            <br/>
            <span class="fr dismiss">
                <a href="https://www.chapman.edu/upgrade-browser.aspx">learn more</a>
                or
                <span class="linklike" role="dismiss upgrade alert">dismiss</span>
                <br/>
            </span>
            <span id="persistence">
                <label>
                    <input aria-role="do not show message again" type="checkbox"/>
                    Do not show this message again
                </label>
            </span>
        </p>
    </div>
</div>