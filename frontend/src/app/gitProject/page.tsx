'use client'
import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import { FiGithub, FiStar, FiGitBranch, FiCalendar, FiEye, FiLock, FiSearch, FiRefreshCw } from 'react-icons/fi';


export default function ProjectsPage() {
  const {
    githubToken,
    githubUser,
    repositories,
    isLoading,
    error,
    fetchGitHubUser,
    fetchGitHubRepos,
    analyzeRepository,
    clearError,
    setGitHubToken,
    checkGitHubTokenStatus
  } = useGitHubStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (!githubToken) {
      checkGitHubTokenStatus().then((hasToken) => {
        if (hasToken) {
          fetchGitHubUser();
          fetchGitHubRepos();
        }
      });
    } else {
      fetchGitHubUser();
      fetchGitHubRepos();
    }
    // eslint-disable-next-line
  }, [githubToken, fetchGitHubUser, fetchGitHubRepos, checkGitHubTokenStatus]);

  // Filter repositories based on search and filter type
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && !repo.private) ||
                         (filterType === 'private' && repo.private);
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    fetchGitHubRepos();
  };

  const handleAnalyzeRepo = async (repoUrl: string) => {
    await analyzeRepository(repoUrl);
  };

  // If no GitHub token, show connect page
  if (!githubToken) {
    return <ConnectGitHubPage />;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-fg)'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: 'var(--color-fg)'
          }}>
            Your GitHub Projects
          </h1>
          <p style={{ 
            color: 'var(--color-fg-secondary)',
            fontSize: '1.125rem'
          }}>
            Manage and analyze your repositories with CodeHealth AI
          </p>
        </div>

        {/* User Info */}
        {githubUser && (
          <div className="card" style={{ 
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <img 
              src={githubUser.avatar_url} 
              alt={githubUser.login}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                border: `2px solid var(--color-border)`
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                marginBottom: '0.25rem'
              }}>
                {githubUser.name || githubUser.login}
              </h2>
              <p style={{ 
                color: 'var(--color-fg-secondary)',
                marginBottom: '0.5rem'
              }}>
                @{githubUser.login}
              </p>
              {githubUser.bio && (
                <p style={{ color: 'var(--color-fg)' }}>{githubUser.bio}</p>
              )}
            </div>
            <div style={{ 
              display: 'flex',
              gap: '2rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--color-fg)'
                }}>
                  {githubUser.public_repos}
                </div>
                <div style={{ color: 'var(--color-fg-secondary)' }}>Repositories</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--color-fg)'
                }}>
                  {githubUser.followers}
                </div>
                <div style={{ color: 'var(--color-fg-secondary)' }}>Followers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--color-fg)'
                }}>
                  {githubUser.following}
                </div>
                <div style={{ color: 'var(--color-fg-secondary)' }}>Following</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ 
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-fg-secondary)'
              }} />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  width: '320px',
                  maxWidth: '100%'
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'private')}
              style={{ minWidth: '150px' }}
            >
              <option value="all">All Repositories</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <FiRefreshCw style={{
              width: '1rem',
              height: '1rem',
              ...(isLoading && {
                animation: 'spin 1s linear infinite'
              })
            }} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert" style={{
            background: 'var(--color-accent)',
            border: `1px solid var(--color-primary)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: 0, color: 'var(--color-fg)' }}>{error}</p>
            <button
              onClick={clearError}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-fg)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem 0'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: `2px solid var(--color-border)`,
              borderTop: `2px solid var(--color-primary)`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {/* Repositories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredRepos.map((repo) => (
            <RepoCard 
              key={repo.id} 
              repo={repo} 
              onAnalyze={() => handleAnalyzeRepo(repo.html_url)}
              isAnalyzing={isLoading}
            />
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredRepos.length === 0 && repositories.length > 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <FiSearch style={{
              width: '4rem',
              height: '4rem',
              color: 'var(--color-fg-secondary)',
              marginBottom: '1rem'
            }} />
            <h3 style={{
              fontSize: '1.25rem',
              marginBottom: '0.5rem'
            }}>
              No repositories found
            </h3>
            <p style={{ color: 'var(--color-fg-secondary)' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* No Repos State */}
        {!isLoading && repositories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <FiGithub style={{
              width: '4rem',
              height: '4rem',
              color: 'var(--color-fg-secondary)',
              marginBottom: '1rem'
            }} />
            <h3 style={{
              fontSize: '1.25rem',
              marginBottom: '0.5rem'
            }}>
              No repositories found
            </h3>
            <p style={{ color: 'var(--color-fg-secondary)' }}>
              Create your first repository on GitHub to get started
            </p>
          </div>
        )}
      </div>

      {/* Add keyframes for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Repository Card Component
interface RepoCardProps {
  repo: any;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

function RepoCard({ repo, onAnalyze, isAnalyzing }: RepoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'var(--transition)',
      cursor: 'pointer'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              margin: 0,
              color: 'var(--color-link)'
            }}>
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                {repo.name}
              </a>
            </h3>
            {repo.private ? (
              <FiLock style={{ 
                width: '1rem', 
                height: '1rem', 
                color: 'var(--color-accent)' 
              }} />
            ) : (
              <FiEye style={{ 
                width: '1rem', 
                height: '1rem', 
                color: 'var(--color-primary)' 
              }} />
            )}
          </div>
          <p style={{
            color: 'var(--color-fg-secondary)',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            lineHeight: '1.4',
            minHeight: '2.8rem'
          }}>
            {repo.description || 'No description available'}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        color: 'var(--color-fg-secondary)',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {repo.language && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                background: 'var(--color-primary)'
              }}></div>
              <span>{repo.language}</span>
            </span>
          )}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <FiStar style={{ width: '1rem', height: '1rem' }} />
            <span>{repo.stargazers_count}</span>
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <FiGitBranch style={{ width: '1rem', height: '1rem' }} />
            <span>{repo.forks_count}</span>
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: 'var(--color-fg-secondary)'
        }}>
          <FiCalendar style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>Updated {formatDate(repo.updated_at)}</span>
        </div>
        
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-btn-fg)',
            border: `1px solid var(--color-primary)`,
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            opacity: isAnalyzing ? 0.6 : 1,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer'
          }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
}

// Connect GitHub Page Component
function ConnectGitHubPage() {
  const handleConnectGitHub = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_GITHUB_AUTH_URL}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '40rem',
        textAlign: 'center',
        padding: '1.5rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <FiGithub style={{
            width: '6rem',
            height: '6rem',
            color: 'var(--color-fg-secondary)',
            marginBottom: '1.5rem'
          }} />
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Connect your GitHub
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--color-fg-secondary)',
            marginBottom: '2rem'
          }}>
            Import your repositories and start analyzing your code health with AI-powered insights
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            What you'll get:
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.25rem',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--color-btn-fg)'
                }}>
                  ✓
                </span>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Repository Analysis
                </h3>
                <p style={{
                  color: 'var(--color-fg-secondary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Get detailed insights into your code quality and health metrics
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'var(--color-accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.25rem',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--color-btn-fg)'
                }}>
                  ✓
                </span>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  AI-Powered Suggestions
                </h3>
                <p style={{
                  color: 'var(--color-fg-secondary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Receive intelligent recommendations for code improvements
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.25rem',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--color-btn-fg)'
                }}>
                  ✓
                </span>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Performance Tracking
                </h3>
                <p style={{
                  color: 'var(--color-fg-secondary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Monitor your repository health over time
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: 'var(--color-accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.25rem',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--color-btn-fg)'
                }}>
                  ✓
                </span>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Team Collaboration
                </h3>
                <p style={{
                  color: 'var(--color-fg-secondary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Share insights and collaborate with your development team
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleConnectGitHub}
          className="btn"
          style={{
            fontSize: '1.125rem',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '0 auto',
            background: 'var(--color-btn-bg)',
            border: `1px solid var(--color-btn-border)`,
            transform: 'scale(1)',
            transition: 'var(--transition), transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FiGithub style={{ width: '1.5rem', height: '1.5rem' }} />
          <span>Connect GitHub Account</span>
        </button>

        <p style={{
          color: 'var(--color-fg-secondary)',
          fontSize: '0.875rem',
          marginTop: '1.5rem'
        }}>
          We'll redirect you to GitHub to authorize access to your repositories. 
          Your data is secure and we only access what's necessary for analysis.
        </p>
      </div>
    </div>
  );
}